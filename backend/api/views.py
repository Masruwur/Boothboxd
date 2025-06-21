from django.core.files.storage import default_storage
from django.contrib.auth.hashers import make_password,check_password
from rest_framework.generics import CreateAPIView,GenericAPIView
from rest_framework.response import Response
from rest_framework.parsers import MultiPartParser, FormParser
from .connection import connect,disconnect
from rest_framework import status
from .serializers import SignUpSerializer,LoginSerializer
from rest_framework_simplejwt.tokens import RefreshToken

class SignUpView(CreateAPIView):
    parser_classes = [MultiPartParser, FormParser]
    serializer_class = SignUpSerializer 

    def perform_create(self,serializer):
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        
        data = serializer.validated_data
        user_name = data['user_name']
        user_title = data['user_title']
        password = data['password']
        image = data.get('user_image')  # the uploaded image

        if not user_name or not user_title or not password:
            return Response({'error': 'All fields required'}, status=400)

        # Save image to disk if provided
        image_path = None
        if image:
            image_name = f"profile_pics/{user_name}_{image.name}"
            path = default_storage.save(image_name, image)
            image_path = default_storage.url(path)

        hashed_password = make_password(password)

        try:
                connection,cursor = connect()
                # Check for existing user
                cursor.execute("SELECT COUNT(*) FROM users WHERE user_title = :user", {'user':user_title})
                if cursor.fetchone()[0] > 0:
                    return Response({'error': 'User title already exists'}, status=409)

                # Insert user
                cursor.execute(
                    "INSERT INTO users (user_id, username, email, password, profile_image) VALUES (users_seq.NEXTVAL,:name,:title,:pass,SYSDATE,:path)",
                    {
                        'name' : user_name,
                        'title' : user_title,
                        'pass' : hashed_password,
                        'path' : image_path 
                    }
                )

                connection.commit()
                disconnect(cursor,connection)
        except Exception as e:
            return Response({'error': str(e)}, status=500)

        
        return Response( {"message": "User created successfully."},status=status.HTTP_201_CREATED)
    








class LoginView(GenericAPIView):
    serializer_class = LoginSerializer

    def post(self, request):
        serializer = self.get_serializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        user_title = serializer.validated_data['user_title']
        password = serializer.validated_data['password']

        try:
            connection, cursor = connect()
            cursor.execute("SELECT user_id, password FROM users WHERE user_title = :title", {'title': user_title})
            row = cursor.fetchone()
            disconnect(cursor, connection)

            if not row:
                return Response({'error': 'User not found'}, status=status.HTTP_404_NOT_FOUND)

            user_id, hashed_password = row

            if not check_password(password, hashed_password):
                return Response({'error': 'Incorrect password'}, status=status.HTTP_401_UNAUTHORIZED)

            # Create JWT token manually
            refresh = RefreshToken.for_user(None)  # You don’t have a Django user object, so we’ll customize payload
            refresh['user_id'] = user_id
            refresh['user_title'] = user_title

            return Response({
                'access': str(refresh.access_token),
                'refresh': str(refresh)
            }, status=status.HTTP_200_OK)

        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    

