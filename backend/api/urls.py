from django.urls import path
from .views import SignUpView,LoginView

urlpatterns = [
    path('signup/',view=SignUpView.as_view(),name='signup'),
    path('login/',view=LoginView.as_view(),name='login'),
]