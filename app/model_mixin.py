from io import BytesIO

from django.core.files import File
from django.db import models
from django.utils import timezone
from PIL import Image


class ModelMixin(models.Model):
    created_at = models.DateTimeField(default=timezone.now)

    class Meta:
        abstract = True


class AbstractImage(ModelMixin):
    name = models.CharField(max_length=255, null=True, blank=True)
    description = models.CharField(max_length=255, null=True, blank=True)
    image = models.ImageField(null=True, blank=True, upload_to="products")
    # image = models.ImageField(
    #     size=[375, 610], null=True, blank=True, upload_to="products"
    # )

    is_primary = models.BooleanField(default=False)

    class Meta:
        abstract = True

    @classmethod
    def compress_image(cls, image):
        im = Image.open(image)
        image_obj = BytesIO()
        im.save(image_obj, format="JPEG", quality=70)
        return File(image_obj, name=image.name)
