from django.urls import path
from . import views, register, login, edit, two_fa
from rest_framework_simplejwt.views import TokenRefreshView, TokenObtainPairView


urlpatterns = [
    path('login/', login.login_view),
    path('register/', register.register_view),
    path('logout/', views.logout_view),
    path('edit/', edit.edit_view),
    path('change-avatar/', edit.change_avatar),
    path('token/', TokenObtainPairView.as_view()),
    path('token/refresh/', TokenRefreshView.as_view()),
    path('two-factor/', two_fa.two_factor),
    path('verify-2FA/', two_fa.verify_2FA),
    path('add-pass/', views.add_password),
    # path('disable-2FA/', two_fa.disable_2FAle_2FA'),
]
