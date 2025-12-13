# Dockerfile for Graph Node with Nginx proxy
# Note: For production, consider deploying IPFS separately or using managed IPFS

FROM graphprotocol/graph-node:latest

# Install nginx and curl for reverse proxy and health checks
RUN apt-get update && \
    apt-get install -y nginx curl && \
    apt-get clean && \
    rm -rf /var/lib/apt/lists/*

# Copy nginx configuration (graph-node uses Debian, so use sites-available)
COPY nginx.conf /etc/nginx/sites-available/default
RUN ln -sf /etc/nginx/sites-available/default /etc/nginx/sites-enabled/default
RUN rm -f /etc/nginx/sites-enabled/default.bak

# Update nginx.conf to proxy to localhost:8000 (graph-node's internal port)
RUN sed -i 's|proxy_pass http://graph_node;|proxy_pass http://localhost:8000;|g' /etc/nginx/sites-available/default

# Create startup script that runs both nginx and graph-node
RUN echo '#!/bin/bash\n\
set -e\n\
# Start nginx in background\n\
nginx\n\
# Start graph-node in foreground\n\
exec graph-node \\\n\
  --postgres-url postgresql://${POSTGRES_USER}:${POSTGRES_PASSWORD}@${POSTGRES_HOST}:5432/${POSTGRES_DB} \\\n\
  --ipfs ${IPFS_HOST}:5001 \\\n\
  --ethereum-rpc ${ETHEREUM_RPC_URL} \\\n\
  --node-id default\n\
' > /start.sh && chmod +x /start.sh

EXPOSE 80

CMD ["/start.sh"]

