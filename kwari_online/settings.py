import os
from pathlib import Path

# Build paths inside the project like this: BASE_DIR / 'subdir'.
BASE_DIR = Path(__file__).resolve().parent.parent

# SECURITY WARNING: keep the secret key used in production secret!
SECRET_KEY = 'n%vs&8*ywk8q1#0y1mhw4&%brdc&e#xhgls79j&yorx$p@1w9o'

# SECURITY WARNING: don't run with debug turned on in production!
DEBUG = True

ALLOWED_HOSTS = ['127.0.0.1']

# Application definition
INSTALLED_APPS = [
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
    'login',
    'app',
    'agent',
    'background_task',
]

MIDDLEWARE = [
    'django.middleware.security.SecurityMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
]

ROOT_URLCONF = 'kwari_online.urls'

TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [],
        'APP_DIRS': True,
        'OPTIONS': {
            'context_processors': [
                'django.template.context_processors.debug',
                'django.template.context_processors.request',
                'django.contrib.auth.context_processors.auth',
                'django.contrib.messages.context_processors.messages',
            ],
        },
    },
]

WSGI_APPLICATION = 'kwari_online.wsgi.application'


# Database
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.postgresql',
        'NAME': os.environ.get('DB_NAME', 'kwari_online'),
        'USER': os.environ.get('PGUSER', 'postgres'),
        'PASSWORD': os.environ.get('PGPASSWORD', 'postgres'),
        'HOST': os.environ.get('PGHOST', '127.0.0.1'),
        'PORT': os.environ.get('PGPORT', '5432'),
    },
}


# Password validation
AUTH_PASSWORD_VALIDATORS = [
    {
        'NAME': 'django.contrib.auth.password_validation.UserAttributeSimilarityValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.MinimumLengthValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.CommonPasswordValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.NumericPasswordValidator',
    },
]


# Internationalization
LANGUAGE_CODE = 'en-us'

TIME_ZONE = 'Africa/Bangui'

USE_I18N = True

USE_L10N = True

USE_TZ = True


# Static files (CSS, JavaScript, Images)
STATICFILES_DIRS = (
    os.path.join(BASE_DIR, 'metronic'),
)

STATIC_ROOT = os.path.join(BASE_DIR, 'static')
STATIC_URL = '/static/'

MEDIA_ROOT = os.path.join(BASE_DIR, 'media')
MEDIA_URL = '/media/'


# EMAIL
EMAIL_BACKEND = 'django.core.mail.backends.console.EmailBackend'
EMAIL_HOST = 'smtp.gmail.com'
EMAIL_USE_TLS = True
EMAIL_PORT = 587
EMAIL_HOST_USER = 'mypayrep@gmail.com'
EMAIL_HOST_PASSWORD = 'reppay@1920'
SENDER_EMAIL = 'mypayrep@gmail.com'
SENDER_ID = 'PAYREP'

REG_MESSAGE = "kindly use the pin below to register your device." \
              "Username:%s" \
              "PIN:%s"


# SESSIONS
# SESSION_COOKIE_AGE = 36000
# SESSION_EXPIRE_SECONDS = 3600
# SESSION_EXPIRE_AFTER_LAST_ACTIVITY = True
# SESSION_EXPIRE_AFTER_LAST_ACTIVITY_GRACE_PERIOD = 600 # AFTER 1MINS


APP_NAME = 'DAN KWARAI'

MERCHANT_ID = 'dan_kwarai'

AGGREGATOR_URL = 'http://127.0.0.1:8000/'

AUTHORIZATION = 'MYPAYREP-2ed6aeb45651b38c33526708dc21d985f60fc8ee4865298dc2cab5d1f2efdf2b'

USER_TYPES = (
    ("staff", "staff"),
    ("admin", "admin"),
)

PERMISSIONS = ['admin', 'staff', 'accounts', 'add users']
