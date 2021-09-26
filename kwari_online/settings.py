import os
from pathlib import Path
from dotenv import load_dotenv

# Build paths inside the project like this: BASE_DIR / 'subdir'.
BASE_DIR = Path(__file__).resolve().parent.parent

# Load environment variables
path = os.path.join(BASE_DIR, "kwari_online/.env")
load_dotenv(path)

# SECURITY WARNING: keep the secret key used in production secret!
SECRET_KEY = os.getenv(
    "SECRET_KEY"
)  # "n%vs&8*ywk8q1#0y1mhw4&%brdc&e#xhgls79j&yorx$p@1w9o"

# SECURITY WARNING: don't run with debug turned on in production!
DEBUG = True

ALLOWED_HOSTS = ["*"]

# Application definition
INSTALLED_APPS = [
    "django.contrib.admin",
    "django.contrib.auth",
    "django.contrib.contenttypes",
    "django.contrib.sessions",
    "django.contrib.messages",
    "django.contrib.staticfiles",
    "login",
    "app",
    "agent",
    "background_task",
]

MIDDLEWARE = [
    "django.middleware.security.SecurityMiddleware",
    "django.contrib.sessions.middleware.SessionMiddleware",
    "django.middleware.common.CommonMiddleware",
    "django.middleware.csrf.CsrfViewMiddleware",
    "django.contrib.auth.middleware.AuthenticationMiddleware",
    "django.contrib.messages.middleware.MessageMiddleware",
    "django.middleware.clickjacking.XFrameOptionsMiddleware",
]

ROOT_URLCONF = "kwari_online.urls"

TEMPLATES = [
    {
        "BACKEND": "django.template.backends.django.DjangoTemplates",
        "DIRS": [],
        "APP_DIRS": True,
        "OPTIONS": {
            "context_processors": [
                "django.template.context_processors.debug",
                "django.template.context_processors.request",
                "django.contrib.auth.context_processors.auth",
                "django.contrib.messages.context_processors.messages",
            ],
        },
    },
]

WSGI_APPLICATION = "kwari_online.wsgi.application"


# Database
DATABASES = {
    "default": {
        "ENGINE": "django.db.backends.postgresql",
        "NAME": os.getenv("DB_NAME", "kwari_online"),
        "USER": os.getenv("PGUSER", "postgres"),
        "PASSWORD": os.getenv("PGPASSWORD", "postgres"),
        "HOST": os.getenv("PGHOST", "127.0.0.1"),
        "PORT": os.getenv("PGPORT", "5432"),
    },
}


# Password validation
AUTH_PASSWORD_VALIDATORS = [
    {
        "NAME": "django.contrib.auth.password_validation.UserAttributeSimilarityValidator",
    },
    {
        "NAME": "django.contrib.auth.password_validation.MinimumLengthValidator",
    },
    {
        "NAME": "django.contrib.auth.password_validation.CommonPasswordValidator",
    },
    {
        "NAME": "django.contrib.auth.password_validation.NumericPasswordValidator",
    },
]


# Internationalization
LANGUAGE_CODE = "en-us"

TIME_ZONE = "Africa/Bangui"

USE_I18N = True

USE_L10N = True

USE_TZ = True


# Static files (CSS, JavaScript, Images)
STATICFILES_DIRS = (os.path.join(BASE_DIR, "metronic"),)

STATIC_ROOT = os.path.join(BASE_DIR, "static")
STATIC_URL = "/static/"

MEDIA_ROOT = os.path.join(BASE_DIR, "media")
MEDIA_URL = "/media/"


# EMAIL
EMAIL_BACKEND = "django.core.mail.backends.console.EmailBackend"
EMAIL_HOST = os.getenv("EMAIL_HOST")
EMAIL_USE_TLS = True
EMAIL_PORT = os.getenv("EMAIL_PORT")
EMAIL_HOST_USER = os.getenv("EMAIL_HOST_USER")
EMAIL_HOST_PASSWORD = os.getenv("EMAIL_HOST_PASSWORD")
SENDER_EMAIL = os.getenv("SENDER_EMAIL")
SENDER_ID = os.getenv("SENDER_ID")


REG_MESSAGE = "kindly use the pin below to register your device." "Username:%s" "PIN:%s"


# SESSIONS
# SESSION_COOKIE_AGE = 36000
# SESSION_EXPIRE_SECONDS = 3600
# SESSION_EXPIRE_AFTER_LAST_ACTIVITY = True
# SESSION_EXPIRE_AFTER_LAST_ACTIVITY_GRACE_PERIOD = 600 # AFTER 1MINS

APP_NAME = os.getenv("APP_NAME")

MERCHANT_ID = os.getenv("MERCHANT_ID")

MERCHANT_INIT = os.getenv("MERCHANT_INIT")

AGGREGATOR_URL = os.getenv("AGGREGATOR_URL")

AUTHORIZATION = os.getenv("AUTHORIZATION")


USER_TYPES = (
    ("staff", "staff"),
    ("admin", "admin"),
)

PERMISSIONS = ["admin", "staff", "accounts", "add users"]
