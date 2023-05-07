import logging
from time import sleep

from celery import current_task, shared_task
from common_models.models import CeleryFileResults

from .export_utils import converter

logger = logging.getLogger(__name__)


@shared_task
def export_allotments_csv():
    handler = converter.convert_to_csv_v1()
    logger.info("creating file: %s", current_task.request.id)
    file = CeleryFileResults(
        id=current_task.request.id,
        file=handler.bio.getvalue(),
        filename="allotments_export.csv"
    )
    file.save()
    logger.info("file '%s' created", current_task.request.id)
    return file.id


@shared_task
def export_teacher_allotments_csv():
    handler = converter.convert_allotments_to_csv_teacher_v1()
    logger.info("creating file %s", current_task.request.id)
    file = CeleryFileResults(
        id=current_task.request.id,
        file=handler.bio.getvalue(),
        filename="teacher_allotments.csv"
    )
    file.save()
    logger.info("file created for %s", current_task.request.id)
    return file.id


@shared_task
def add(x, y):
    sleep(30)
    return x + y


@shared_task
def mul(x, y):
    return x * y


@shared_task
def xsum(numbers):
    return sum(numbers)
