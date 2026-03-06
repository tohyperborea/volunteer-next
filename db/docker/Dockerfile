FROM postgres:18

# Install pg_cron package
RUN apt-get update && \
    apt-get -y install postgresql-18-cron && \
    rm -rf /var/lib/apt/lists/*

