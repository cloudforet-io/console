FROM nginx:stable

COPY ./k8s/nginx.conf /etc/nginx/conf.d/wconsole-client.conf
COPY ./k8s/check.html /var/www/api/check
COPY ./dist /var/www

# Define working directory.
WORKDIR /var/www

EXPOSE 80
EXPOSE 443
