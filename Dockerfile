FROM php:8.1-apache

# Enable Apache mod_rewrite
RUN a2enmod rewrite

# Install necessary PHP extensions
RUN docker-php-ext-install -j$(nproc) opcache

# Set working directory
WORKDIR /var/www/html

# Copy application files
COPY . /var/www/html/

# Create data directory with proper permissions
RUN mkdir -p /var/www/html/data && \
    chown -R www-data:www-data /var/www/html/data && \
    chmod -R 755 /var/www/html/data

# Configure Apache to allow .htaccess and set proper permissions
RUN echo '<Directory /var/www/html>\n\
    Options Indexes FollowSymLinks\n\
    AllowOverride All\n\
    Require all granted\n\
</Directory>' > /etc/apache2/conf-available/custom.conf && \
    a2enconf custom

# Expose port
EXPOSE 80

# Start Apache
CMD ["apache2-foreground"]
