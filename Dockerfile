# Official multi-platform release manifest, verified to include Linux ARM64.
FROM openclaw/openclaw:2026.10.10@sha256:1e5ee6c7d02d5b5f64f9cf26a30c7ef7d4ec292f0d25fa590f4b7e103e8bf799
USER root
RUN mkdir -p /home/node/.openclaw/workspace && chown -R node:node /home/node/.openclaw
COPY --chown=node:node docker/ /app/deployment/
USER node
ENV HOME=/home/node OPENCLAW_NO_RESPAWN=1 NODE_COMPILE_CACHE=/home/node/.openclaw/compile-cache
ENTRYPOINT ["node", "/app/deployment/start.mjs"]
