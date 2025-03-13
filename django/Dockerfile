FROM python

WORKDIR  /django/

COPY backend  .

COPY django_entrypoint.sh /

RUN  pip install -r /django/requirements.txt && chmod +x /django_entrypoint.sh

CMD ["bash","/django_entrypoint.sh" ]
