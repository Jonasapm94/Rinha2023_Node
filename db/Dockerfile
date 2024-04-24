FROM postgres

# Copy SQL script to container
COPY ./schema.sql /docker-entrypoint-initdb.d/init.sql

# Set environment variables for PostgreSQL
ENV POSTGRES_DB=rinha2023
ENV POSTGRES_USER=postgres
ENV POSTGRES_PASSWORD="123"

EXPOSE 5432

