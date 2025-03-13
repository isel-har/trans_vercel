FROM nginx

RUN  openssl req -newkey rsa:4096 -x509 -sha256 -days 365 -nodes \
    -out /etc/ssl/certs/pong2.crt \
    -keyout /etc/ssl/private/pong2.key \
    -subj "/C=MA/ST=Khouribga/L=Khouribga/O=1337 School/OU=llescure/CN=${HOST}"

COPY default.conf  /etc/nginx/conf.d/

CMD [ "nginx", "-g", "daemon off;" ]