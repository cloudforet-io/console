FROM nginx:stable

#COPY ./dockerConfig/nginx.conf /etc/nginx/conf.d/default.conf
COPY ./k8s/check.html /var/www/api/check
COPY ./dist /var/www

# Define working directory.
WORKDIR /etc/nginx

EXPOSE 80
EXPOSE 443
