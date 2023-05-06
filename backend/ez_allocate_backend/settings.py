"""
Django settings for ez_allocate_backend project.

Generated by 'django-admin startproject' using Django 4.1.6.

For more information on this file, see
https://docs.djangoproject.com/en/4.1/topics/settings/

For the full list of settings and their values, see
https://docs.djangoproject.com/en/4.1/ref/settings/
"""
from os import getenv
from pathlib import Path

# Build paths inside the project like this: BASE_DIR / 'subdir'.
BASE_DIR = Path(__file__).resolve().parent.parent

# yapf: disable
# Quick-start development settings - unsuitable for production
# See https://docs.djangoproject.com/en/4.1/howto/deployment/checklist/

# SECURITY WARNING: keep the secret key used in production secret!
SECRET_KEY = 'django-insecure-(%sp-nqnn$erii=ra&gx_uyiv)ornelvd+zynl0z2-r566^0+4'

# SECURITY WARNING: don't run with debug turned on in production!
DEBUG = True

ALLOWED_HOSTS = []
ALLOWED_HOSTS.extend(
    i for i in getenv("ALLOWED_HOSTS", "").split(",") if i != ""
)

# CUSTOM SETTINGS
CUSTOM_SETTINGS = {
    "MANUAL_CHOICE_NUMBER": 0,
    "MAX_TEACHER_WORKLOAD_HOURS": 14,
    "DISABLE__TEACHER_WORKLOAD_CHECK": True,
    "DISABLE__FIRST_LECTURER_CHECK": True,
}

# CORS SETTINGS
CORS_ALLOWED_ORIGINS = [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    "http://localhost:5173",
    "http://127.0.0.1:5173"
]
# yapf: enable
CORS_ALLOWED_ORIGINS.extend(
    i for i in getenv("CORS_ALLOWED_ORIGINS", "").split(",") if i != ""
)
CSRF_TRUSTED_ORIGINS = []
CSRF_TRUSTED_ORIGINS.extend(
    i for i in getenv("CORS_ALLOWED_ORIGINS", "").split(",") if i != ""
)
# yapf: disable
# REST FRAMEWORK SETTINGS
REST_FRAMEWORK = {
    'DEFAULT_SCHEMA_CLASS': 'drf_spectacular.openapi.AutoSchema',
}
# DOCS: SPECTACULAR SETTINGS
SPECTACULAR_SETTINGS = {
    'TITLE': 'ez-allocate API docs',
    'SERVE_INCLUDE_SCHEMA': False,
    'ENUM_NAME_OVERRIDES': {
        'AssignedStatusEnum': 'common_models.models.AllotmentStatus',
        'AllotmentStatusEnum': 'common_models.models.AllotmentStatus',
    },
    'SCHEMA_PATH_PREFIX': r'/api/',
}

# LOGS: SETTINGS
LOGGING = {
    'version': 1,
    'disable_existing_loggers': False,
    'handlers': {
        'console': {
            'class': 'logging.StreamHandler',
            'formatter': 'verbose'
        },
    },
    'loggers': {
        'common_models': {
            'handlers': ['console'],
        },
        'api': {
            'handlers': ['console'],
        }
    },
    'formatters': {
        'verbose': {
            'format': '{levelname} - [{asctime}]:[{name}] {message}',
            'datefmt': '%d/%b/%Y %H:%M:%S',
            'style': '{',
        }
    },

}

# Celery Configuration Options
CELERY_TIMEZONE = "Asia/Kolkata"
CELERY_TASK_TRACK_STARTED = True
CELERY_TASK_TIME_LIMIT = 5 * 60  # 5 minutes?
CELERY_BROKER_URL = getenv("CELERY_BROKER_URL", None) or 'redis://localhost:6379/0'
CELERY_RESULT_BACKEND = getenv("CELERY_RESULT_BACKEND", None) or 'redis://localhost:6379/0'
CELERY_RESULT_EXTENDED = True

# Application definition

INSTALLED_APPS = [
    'common_models',
    'api',
    'tasks',
    'rest_framework',
    'django_filters',
    'corsheaders',
    'drf_spectacular',
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
]

MIDDLEWARE = [
    'corsheaders.middleware.CorsMiddleware',
    'django.middleware.security.SecurityMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
]

ROOT_URLCONF = 'ez_allocate_backend.urls'

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

WSGI_APPLICATION = 'ez_allocate_backend.wsgi.application'


# Database
# https://docs.djangoproject.com/en/4.1/ref/settings/#databases

DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.sqlite3',
        'NAME': BASE_DIR / ('mock-db.sqlite3'
                            if getenv("USE_MOCK_DB", "False").lower() in ('true', '1')
                            else 'db.sqlite3'
                            ),
    }
}


# Password validation
# https://docs.djangoproject.com/en/4.1/ref/settings/#auth-password-validators

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
# https://docs.djangoproject.com/en/4.1/topics/i18n/

LANGUAGE_CODE = 'en-us'

TIME_ZONE = 'UTC'

USE_I18N = True

USE_TZ = True


# Static files (CSS, JavaScript, Images)
# https://docs.djangoproject.com/en/4.1/howto/static-files/

STATIC_URL = 'static/'

# Default primary key field type
# https://docs.djangoproject.com/en/4.1/ref/settings/#default-auto-field

DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'
