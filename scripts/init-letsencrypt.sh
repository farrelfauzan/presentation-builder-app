#!/bin/bash

# SSL Certificate Setup Script for Presentation Builder
# Run this script on your VPS to obtain Let's Encrypt certificates

set -e

# Configuration
DOMAINS="api-presentation-builder.farrel-space.online,storage.farrel-space.online,minio.farrel-space.online"
EMAIL=""  # UPDATE THIS
STAGING=0 # Set to 1 for testing (to avoid rate limits)

# Paths
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"
CERTBOT_PATH="$PROJECT_DIR/docker/certbot"

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo -e "${GREEN}=== SSL Certificate Setup ===${NC}"
echo "Project directory: $PROJECT_DIR"

# Check if docker is installed
if ! [ -x "$(command -v docker)" ]; then
  echo -e "${RED}Error: Docker is not installed.${NC}" >&2
  exit 1
fi

# Create required directories
echo -e "${YELLOW}Creating directories...${NC}"
mkdir -p "$CERTBOT_PATH/conf"
mkdir -p "$CERTBOT_PATH/www"

# Convert comma-separated domains to array
IFS=',' read -ra DOMAIN_ARRAY <<< "$DOMAINS"
PRIMARY_DOMAIN="${DOMAIN_ARRAY[0]}"

# Build domain args for certbot
DOMAIN_ARGS=""
for domain in "${DOMAIN_ARRAY[@]}"; do
  DOMAIN_ARGS="$DOMAIN_ARGS -d $domain"
done

# Staging flag
STAGING_ARG=""
if [ "$STAGING" == "1" ]; then
  STAGING_ARG="--staging"
  echo -e "${YELLOW}Running in STAGING mode (test certificates)${NC}"
fi

# Check if certificates already exist
if [ -f "$CERTBOT_PATH/conf/live/$PRIMARY_DOMAIN/fullchain.pem" ]; then
  echo -e "${YELLOW}Existing certificates found for $PRIMARY_DOMAIN${NC}"
  echo "Do you want to renew? (y/N)"
  read -r decision
  if [ "$decision" != "Y" ] && [ "$decision" != "y" ]; then
    echo "Exiting..."
    exit 0
  fi
fi

# Create self-signed certificate for initial nginx startup
echo -e "${YELLOW}Creating temporary self-signed certificate...${NC}"
mkdir -p "$CERTBOT_PATH/conf/live/$PRIMARY_DOMAIN"
openssl req -x509 -nodes -newkey rsa:4096 -days 1 \
  -keyout "$CERTBOT_PATH/conf/live/$PRIMARY_DOMAIN/privkey.pem" \
  -out "$CERTBOT_PATH/conf/live/$PRIMARY_DOMAIN/fullchain.pem" \
  -subj "/CN=localhost" 2>/dev/null

# Start nginx with temporary cert
echo -e "${YELLOW}Starting nginx...${NC}"
cd "$PROJECT_DIR"
docker compose -f docker-compose.prod.yml up -d nginx
sleep 5

# Delete temporary certificate
echo -e "${YELLOW}Removing temporary certificate...${NC}"
rm -rf "$CERTBOT_PATH/conf/live/$PRIMARY_DOMAIN"
rm -rf "$CERTBOT_PATH/conf/archive/$PRIMARY_DOMAIN" 2>/dev/null || true
rm -rf "$CERTBOT_PATH/conf/renewal/$PRIMARY_DOMAIN.conf" 2>/dev/null || true

# Request Let's Encrypt certificate
echo -e "${GREEN}Requesting Let's Encrypt certificate for: ${DOMAINS}${NC}"
docker run --rm \
  -v "$CERTBOT_PATH/conf:/etc/letsencrypt" \
  -v "$CERTBOT_PATH/www:/var/www/certbot" \
  certbot/certbot certonly \
    --webroot \
    -w /var/www/certbot \
    $STAGING_ARG \
    --email "$EMAIL" \
    --rsa-key-size 4096 \
    --agree-tos \
    --no-eff-email \
    --force-renewal \
    $DOMAIN_ARGS

# Reload nginx
echo -e "${GREEN}Reloading nginx...${NC}"
docker compose -f docker-compose.prod.yml exec nginx nginx -s reload

echo ""
echo -e "${GREEN}=== Certificate setup complete! ===${NC}"
echo ""
echo "Certificates stored in: $CERTBOT_PATH/conf/live/$PRIMARY_DOMAIN/"
echo ""
echo -e "${YELLOW}Auto-renewal:${NC}"
echo "The certbot container in docker-compose.prod.yml handles auto-renewal."
echo "Certificates will be renewed automatically every 12 hours if needed."
echo ""
echo -e "${YELLOW}To manually renew:${NC}"
echo "docker compose -f docker-compose.prod.yml exec certbot certbot renew"
echo "docker compose -f docker-compose.prod.yml exec nginx nginx -s reload"
