FROM n8nio/n8n:latest

# Hugging Face Spaces run as a non-root user (usually 1000)
# We need to ensure that the node user has the correct permissions
USER root
RUN mkdir -p /home/node/.n8n && chown -R node:node /home/node

# Switch back to the n8n user
USER node

# Use the standard n8n port
ENV N8N_PORT=5678
ENV N8N_LISTEN_ADDRESS=0.0.0.0

# Memory management for Render Free Tier (512MB limit)
# Forces Node.js to garbage collect before hitting the container limit
ENV NODE_OPTIONS="--max-old-space-size=400"

# Expose the port so Render knows where to route traffic
EXPOSE 5678

# Optional: Set this to your HF Space URL later to fix webhook URLs
# ENV WEBHOOK_URL=https://your-space-name.hf.space


