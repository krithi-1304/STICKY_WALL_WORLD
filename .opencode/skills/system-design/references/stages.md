# Stages S0–S3

| Stage | User-visible | Tech | Exit criteria |
|-------|--------------|------|---------------|
| S0 | Lobby + room + stickies | Local persist | Refresh keeps notes |
| S1 | Share URL | DB + slug + view/edit token | Friend opens link, sees wall |
| S2 | Co-edit | Realtime LWW | Two users move notes |
| S3 | Scale | Quotas, CDN, monitoring | 1k notes/room OK |

Gate: do not start Sn+1 features until Sn exit criteria pass.
