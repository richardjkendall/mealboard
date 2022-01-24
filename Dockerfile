FROM node:14 as uibuilder
RUN mkdir -p /build/ui
WORKDIR /build
ADD ui ui

RUN cd ui; yarn install
RUN cd ui; yarn build

FROM ubuntu
# install apache and modules we need
RUN apt-get update
RUN DEBIAN_FRONTEND=noninteractive \
    apt-get -y install \
               apache2 \
               python3 python3-pip \
               libapache2-mod-wsgi-py3

# make base folder
RUN mkdir /app
RUN mkdir -p {/app/models,/app/blueprints}

# install deps
ADD requirements.txt /app
RUN pip install -r /app/requirements.txt

# add code
ADD *.py /app/
ADD *.wsgi /app/
ADD models /app/models
ADD blueprints /app/blueprints

# add the GUI files needed
COPY --from=uibuilder /build/ui/build /app/static/

# copy in apache conf
COPY conf.d/000-default.conf /etc/apache2/sites-available/000-default.conf
COPY conf.d/ports.conf /etc/apache2/ports.conf

# expose HTTP port
EXPOSE 5000

# run apache in the foreground
CMD /usr/sbin/apache2ctl -D FOREGROUND