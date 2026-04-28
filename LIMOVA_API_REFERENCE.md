# Limova API Reference

Local working reference assembled from the exported docs in `limova_doc_site/`.

## Sources

- Guides root: `limova_doc_site/docs.html`
- API root: `limova_doc_site/reference.html`
- Guides folder: `limova_doc_site/docs/`
- Reference folder: `limova_doc_site/reference/`
- Product brief: `Besoin.pdf`

## What This File Is For

This is a navigation-first reference for working inside the local Limova docs export.
It is optimized for:

- finding the right doc page quickly
- understanding how Limova models its platform
- knowing which endpoint family to inspect next
- remembering notable behaviors like credits, SSE streaming, and workspace scoping

## Export Status

The local export is mostly usable.

- Guides found: 25 non-404 pages
- API reference pages found: 133 non-404 pages
- Some duplicated convenience pages in the export resolve to `404 Not Found`
- The primary guide pages and primary endpoint pages are present

## Core Platform Model

From the guides and endpoint structure, Limova revolves around these objects:

- `workspace`: the main tenant boundary for users, files, conversations, agents, campaigns, and billing
- `member` / `invitation`: workspace access and roles
- `file`: uploaded knowledge/document asset, often processed for RAG
- `folder`: hierarchical organization for files, can also be marked as default context
- `conversation`: interactive thread with an AI agent
- `message`: a message inside a conversation; AI responses stream back via SSE
- `agent`: built-in or configured AI agent
- `autonomous agent`: more operational/connected agent entity with metrics, status, and integrations
- `power-up`: callable tool/function used by agents
- `artefact`: persisted output or execution record from a power-up or campaign/content generation flow
- `campaign`: outreach/automation entity, especially LinkedIn and telephony flows
- `subscription` / `credits`: billing and API usage accounting

## Important Behavioral Notes

- Many endpoints are scoped to the current workspace.
- Several pages explicitly mention `x-workspace-id` for workspace-specific reads.
- Most standard operations cost `1 credit`.
- High-cost operations called out in the docs:
  - power-up execution: `240 credits`
  - start/resume sales campaign: `30 credits`
  - start outbound phone campaign: `30 credits`
  - register inbound phone number from Twilio: `3,600 credits`
- Conversation messaging uses `Server-Sent Events (SSE)`.
- File uploads are automatically processed for retrieval/RAG.
- Files and folders can be marked as default context for RAG.
- Some operations are destructive and permanent:
  - delete conversation
  - delete file
  - delete user account

## Best Starting Guides

- `docs/what-is-limova.html`: platform overview
- `docs/quick-start.html`: onboarding flow
- `docs/key-concepts.html`: conceptual glossary / quick reference
- `docs/how-it-all-connects.html`: conversations, agents, artefacts
- `docs/platform-guide.html`: guide directory
- `docs/api-credits.html`: billing and credits
- `docs/roles-permissions.html`: role model
- `docs/uploading-files.html`: file intake behavior
- `docs/managing-files.html`: file lifecycle
- `docs/creating-conversations.html`: conversation setup
- `docs/what-are-power-ups.html`: tool model
- `docs/using-power-ups.html`: power-up usage
- `docs/understanding-artefacts.html`: artefact model

## Common Tasks -> Where To Look

### Get workspace context

- `reference/workspacecontrollergetuserworkspaces.html`
- `reference/workspacecontrollergetworkspace.html`
- `reference/workspacemembercontrollergetworkspacemembers.html`
- `reference/subscriptionusagecontrollergetusage-1.html`

### Start a chat flow

- `reference/conversationcontrollercreateconversation.html`
- `reference/conversationcontrollergetconversations.html`
- `reference/conversationcontrollergetconversationbyid.html`
- `reference/messagecontrollermessage.html`

### Upload knowledge for RAG

- `reference/filecontrollergetsupportedfiletypes.html`
- `reference/filecontrollercheckfiletypesupport.html`
- `reference/filecontrollercreatefile.html`
- `reference/filecontrollerreprocessdocument.html`
- `reference/filecontrollergetdefaultcontextfiles.html`
- `reference/foldercontrollergetdefaultcontextfolders.html`

### Organize documents

- `reference/foldercontrollercreate.html`
- `reference/foldercontrollerfindtree.html`
- `reference/foldercontrollerfindwithtree.html`
- `reference/foldercontrollersearch.html`
- `reference/filecontrollerupdatefile.html`

### Execute a power-up and inspect output

- `reference/powerupfunctionartefactcontrollerexecute.html`
- `reference/powerupfunctionartefactcontrollergetartefact.html`
- `reference/powerupfunctionartefactcontrollergetartefactbyid.html`
- `reference/powerupfunctionartefactcontrollergetartefactbyconversation.html`
- `reference/powerupfunctionartefactcontrollerupdateartefactparameters.html`
- `reference/powerupfunctionartefactcontrollerupdateartefactoutput.html`

### Work with autonomous agents

- `reference/autonomousagentcontrollerfindall.html`
- `reference/autonomousagentcontrollercreate.html`
- `reference/autonomousagentcontrollerfindone.html`
- `reference/autonomousagentcontrollerupdate.html`
- `reference/autonomousagentcontrollerupdatestatus-1.html`
- `reference/autonomousagentconnectioncontrollerfindall-1.html`

### Use integrations / outbound flows

- LinkedIn / social:
  - `reference/linkedinauthcontrollerinitiateauth.html`
  - `reference/facebookauthcontrollerinitiateauth.html`
  - `reference/instagramauthcontrollerinitiateauth.html`
- CMS:
  - `reference/cmsconnectioncontrollerfindall.html`
  - `reference/cmsconnectioncontrollerverify.html`
  - `reference/cmsconnectioncontrollerpublish.html`
- Sales campaigns:
  - `reference/campaigncontrollercreate.html`
  - `reference/campaigncontrollerstart.html`
  - `reference/linkedinprospectioncontrollersendconnectionrequest.html`
  - `reference/linkedinprospectioncontrollersendmessage.html`
- Telephony:
  - `reference/outboundcallcampaigncontrollercreate.html`
  - `reference/outboundcallcampaigncontrollerstart.html`
  - `reference/phoneagentcontrollerupdatephoneagent.html`
  - `reference/twiliophonenumberregistrycontrollerregisterinbound.html`

## Endpoint Map

### User / Subscription

- `reference/usercontrollerme-1.html`: get current user profile
- `reference/usercontrollerpatch-1.html`: partially update user profile, optional avatar upload
- `reference/usercontrollerdelete-1.html`: permanently delete current user account
- `reference/subscriptioncontrollerfindactivebyworkspace-1.html`: get active subscription for a workspace
- `reference/subscriptionusagecontrollergetusage-1.html`: get workspace usage statistics

### Workspace / Team

- `reference/workspacecontrollercreateworkspace.html`: create workspace
- `reference/workspacecontrollergetuserworkspaces.html`: list workspaces for current user
- `reference/workspacecontrollergetworkspace.html`: get current workspace details
- `reference/workspacecontrollerupdateworkspace.html`: update workspace, optional logo upload
- `reference/workspacemembercontrollergetworkspacemembers.html`: list workspace members
- `reference/workspaceinvitationcontrollergetinvitations.html`: list pending invitations
- `reference/workspaceinvitationcontrollerinvitemember.html`: invite member
- `reference/workspaceinvitationcontrolleracceptinvitation.html`: accept invitation
- `reference/workspaceinvitationcontrollerrefuseinvitation.html`: refuse invitation

### Files

- `reference/filecontrollergetfiles.html`: list paginated files in workspace
- `reference/filecontrollercreatefile.html`: upload file
- `reference/filecontrollergetfilebyid.html`: get file metadata/details
- `reference/filecontrollerupdatefile.html`: rename or move file
- `reference/filecontrollerdeletefile.html`: delete file and associated storage/embeddings
- `reference/filecontrollerdownloadfile.html`: download file
- `reference/filecontrollerreprocessdocument.html`: reprocess document for extraction/chunking
- `reference/filecontrollergetfilesbyfolder.html`: list files within a folder
- `reference/filecontrollergetsupportedfiletypes.html`: list supported file types
- `reference/filecontrollercheckfiletypesupport.html`: validate file type support
- `reference/filecontrollergetdefaultcontextfiles.html`: list files marked default context
- `reference/filecontrollersavesharedfile.html`: copy another user's shared file

Important file notes:

- upload page mentions supported formats including `PDF`, `CSV`, `DOCX`, `PPTX`, `XLSX`, `TXT`, `EPUB`, `JSON`, `SRT`
- upload supports query parameters like `folderId`, `useAsDefaultContext`, `isTemporary`
- docs note a file cannot be temporary and in a folder at the same time

### Folders

- `reference/foldercontrollerfindall.html`: list paginated folders
- `reference/foldercontrollercreate.html`: create folder
- `reference/foldercontrollerfindtree.html`: get full folder tree
- `reference/foldercontrollerfindwithtree.html`: get one folder with its subtree
- `reference/foldercontrollersearch.html`: search folders and files
- `reference/foldercontrollergetdefaultcontextfolders.html`: list folders marked default context
- `reference/foldercontrollerdownloadzip.html`: download folder as ZIP

### Conversations / Messages

- `reference/conversationcontrollergetconversations.html`: list paginated conversations
- `reference/conversationcontrollercreateconversation.html`: create conversation
- `reference/conversationcontrollergetconversationbyid.html`: get conversation by ID
- `reference/conversationcontrollerupdateconversation.html`: update conversation details
- `reference/conversationcontrollerdeleteconversation.html`: delete conversation and associated data
- `reference/messagecontrollermessage.html`: create message and stream AI response

Important conversation notes:

- create conversation supports optional agent selection
- create conversation supports optional title
- create conversation supports disabling the first message
- message responses are streamed as `SSE`
- message stream events include start/token-style incremental events per the page summary

### Agents

- `reference/agentcontrollergetagents.html`: list agents available in current workspace
- `reference/agentcontrollerget.html`: get agent details/configuration
- `reference/agentcontrollergetagenttools.html`: list tools/power-ups configured for an agent
- `reference/charlypluscontrollergetconfig.html`: get Charly+ WhatsApp configuration

### Autonomous Agents / Connections / WhatsApp

- `reference/autonomousagentcontrollerfindall.html`: list paginated autonomous agents with metrics/connections
- `reference/autonomousagentcontrollercreate.html`: create autonomous agent
- `reference/autonomousagentcontrollerfindone.html`: get autonomous agent by ID with metrics
- `reference/autonomousagentcontrollerupdate.html`: update autonomous agent
- `reference/autonomousagentcontrollerdelete.html`: delete autonomous agent
- `reference/autonomousagentcontrollerupdatestatus-1.html`: update autonomous agent status
- `reference/autonomousagentconnectioncontrollerfindall-1.html`: list connections for an agent
- `reference/autonomousagentconnectioncontrollercreate-1.html`: create connection
- `reference/autonomousagentconnectioncontrollerfindone-1.html`: get connection by ID
- `reference/autonomousagentconnectioncontrollerupdate-1.html`: update connection
- `reference/autonomousagentconnectioncontrollerdelete-1.html`: delete connection
- `reference/autonomousagentwhatsappoauthcontrollerinitiateoauth-1.html`: start WhatsApp OAuth / embedded signup
- `reference/autonomousagentwhatsappoauthcontrollerhandlecallback-1.html`: handle WhatsApp OAuth callback
- `reference/autonomousagentwhatsappoauthcontrollerrevokeconnection-1.html`: revoke WhatsApp connection
- `reference/autonomousagentwhatsappoauthcontrollergenerateqrcode-1.html`: generate WhatsApp QR code

Important autonomous agent notes:

- list endpoint supports pagination
- list endpoint supports status filtering
- list endpoint supports sorting/order controls
- QR code endpoint is explicitly for starting a WhatsApp conversation with the agent

### Power-Ups / Artefacts

- `reference/powerupfunctionartefactcontrollerexecute.html`: execute power-up function
- `reference/powerupfunctionartefactcontrollergetartefact.html`: list artefacts with optional filters
- `reference/powerupfunctionartefactcontrollergetartefactbyid.html`: get artefact by ID
- `reference/powerupfunctionartefactcontrollergetartefactbyconversation.html`: get artefacts for a conversation
- `reference/powerupfunctionartefactcontrollerdeleteartefact.html`: delete artefact
- `reference/powerupfunctionartefactcontrollercancelartefact.html`: cancel artefact execution
- `reference/powerupfunctionartefactcontrollerupdateartefactparameters.html`: update artefact parameters/status
- `reference/powerupfunctionartefactcontrollerupdateartefactoutput.html`: update artefact output
- `reference/powerupfunctionartefactcontrollergetcontents.html`: list content artefacts
- `reference/powerupfunctionartefactcontrollergetcampaigns.html`: list campaign artefacts
- `reference/powerupfunctionartefactcontrollergetagents.html`: list agent artefacts

Important artefact notes:

- execution is expensive relative to most other endpoints
- artefacts are the persisted output/execution record for tool usage
- there are specialized retrieval views by content, campaign, and agent domains

### Campaigns / LinkedIn Prospecting

- `reference/campaigncontrollerfindall.html`: list campaigns
- `reference/campaigncontrollercreate.html`: create campaign
- `reference/campaigncontrollerfindone.html`: get campaign details
- `reference/campaigncontrollerupdate.html`: update campaign
- `reference/campaigncontrollerdelete.html`: soft delete campaign
- `reference/campaigncontrollerstart.html`: start or resume campaign
- `reference/campaigncontrollerpause.html`: pause campaign
- `reference/campaigncontrollergetstatistics.html`: get campaign statistics
- `reference/linkedinprospectioncontrollersendconnectionrequest.html`: send LinkedIn connection request
- `reference/linkedinprospectioncontrollersendmessage.html`: send LinkedIn direct message

Important campaign notes:

- campaign start is a higher-cost action
- update cannot modify archived or completed campaigns

### Social / CMS

- `reference/linkedinauthcontrollerinitiateauth.html`: initiate LinkedIn OAuth
- `reference/linkedinauthcontrollergetstatus.html`: check LinkedIn connection status
- `reference/facebookauthcontrollerinitiateauth.html`: initiate Facebook OAuth
- `reference/facebookauthcontrollergetstatus.html`: check Facebook connection status
- `reference/instagramauthcontrollerinitiateauth.html`: initiate Instagram OAuth
- `reference/instagramauthcontrollergetstatus.html`: check Instagram connection status
- `reference/cmsconnectioncontrollerfindall.html`: list CMS connections
- `reference/cmsconnectioncontrollercreate.html`: create CMS connection
- `reference/cmsconnectioncontrollerfindone.html`: get CMS connection by ID
- `reference/cmsconnectioncontrollerupdate.html`: update CMS connection
- `reference/cmsconnectioncontrollerdelete.html`: delete CMS connection
- `reference/cmsconnectioncontrollerverify.html`: verify CMS credentials
- `reference/cmsconnectioncontrollerpublish.html`: publish article to CMS

### Telephony / Voice AI

- `reference/outboundcallcampaigncontrollercreate.html`: create outbound call campaign
- `reference/outboundcallcampaigncontrolleraddrecipients.html`: add recipients
- `reference/outboundcallcampaigncontrollerstart.html`: start outbound campaign
- `reference/outboundcallcampaigncontrollerpause.html`: pause outbound campaign
- `reference/outboundcallcampaigncontrollergetstatistics.html`: get outbound stats
- `reference/outboundcallcampaigncontrollergetcalllogs.html`: list phone call logs
- `reference/phoneagentcontrollerupdatephoneagent.html`: update phone agent
- `reference/twiliophonenumberregistrycontrollerregisterinbound.html`: register inbound phone number via Twilio

Important telephony notes:

- outbound start costs `30 credits`
- inbound number registration is the single most expensive item found in the docs export: `3,600 credits`
- phone agent update syncs both application state and ElevenLabs according to the page summary

### Webhooks

- `reference/webhooks.html`: overview
- `reference/webhook-stripe.html`: Stripe webhook
- `reference/webhook-whatsapp.html`: WhatsApp webhook
- `reference/webhook-elevenlabs.html`: ElevenLabs phone webhook
- `reference/webhook-twilio.html`: Twilio validation webhook

## Troubleshooting Guides

- `docs/common-issues.html`
- `docs/file-upload-issues.html`
- `docs/conversation-issues.html`
- `docs/power-up-issues.html`
- `docs/browser-compatibility-issues.html`
- `docs/search-navigation-issues.html`
- `docs/sync-update-issues.html`
- `docs/getting-help.html`

## Known Gaps In The Export

- `reference/authentication.html` is a `404` in the local export
- `reference/rate-limits.html` is a `404` in the local export
- several duplicate or category pages are `404`, but primary endpoint pages still exist
- because authentication is missing from the export, exact auth header conventions and base route templates may need to be inferred from related pages or checked against the live docs if needed

## Working Assumptions To Verify When Needed

These appear likely from the export, but should be validated per endpoint before implementation:

- authentication is probably bearer-token based
- workspace-scoped calls may require `x-workspace-id`
- conversations, files, folders, artefacts, and campaigns follow conventional REST path patterns

## Fast Navigation Pattern

When answering Limova API questions, use this order:

1. identify the domain: workspace, files, folders, conversations, agents, artefacts, campaigns, telephony
2. open the primary guide page if the question is conceptual
3. open the specific endpoint page if the question is operational
4. check whether the action has notable cost or destructive behavior
5. check whether the action is workspace-scoped or streaming

## Recommended Next Expansion

If this reference needs a second pass, add:

- exact request/response schemas for the most-used endpoints
- confirmed auth/header requirements
- concrete route templates and example payloads
- a “typical app flow” section covering workspace -> files -> conversation -> message -> artefact
