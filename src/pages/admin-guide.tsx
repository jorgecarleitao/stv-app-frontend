import React from "react";
import { useTranslation } from "react-i18next";
import { Container, Typography, Box, List, ListItem, ListItemText, Divider } from "@mui/material";

export default function AdminUserGuide() {
  const { t } = useTranslation();
  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Typography variant="h4" gutterBottom>
        {t("Admin Guide")}
      </Typography>
      <Typography variant="body1" paragraph>
        {t("This guide explains how to set up, manage, and monitor an election using the STV system.")}
      </Typography>
      <Divider sx={{ my: 2 }} />
      <Box>
        <Typography variant="h6" gutterBottom>
          {t("Steps for Administrators:")}
        </Typography>
        <List>
          <ListItem>
            <ListItemText
              primary={t("1. Create a new election")}
              secondary={t("Set the title, description, candidates, number of seats, and start/end dates. Save and share the admin link with other administrators.")}
            />
          </ListItem>
          <ListItem>
            <ListItemText
              primary={t("2. Generate voting tokens")}
              secondary={t("On the admin page, generate tokens for each voter. Each token is unique and should be distributed individually.")}
            />
          </ListItem>
          <ListItem>
            <ListItemText
              primary={t("3. Distribute tokens to voters")}
              secondary={t("Send each token to the respective voter. The voter will use the token to access their ballot and vote.")}
            />
          </ListItem>
          <ListItem>
            <ListItemText
              primary={t("4. Monitor election progress")}
              secondary={t("You can view the status of votes and tokens on the admin page.")}
            />
          </ListItem>
          <ListItem>
            <ListItemText
              primary={t("5. Close and publish results")}
              secondary={t("After the election ends, results are calculated automatically. The system shows elected candidates, Copeland order, and the pairwise comparison matrix.")}
            />
          </ListItem>
        </List>
      </Box>
      <Divider sx={{ my: 2 }} />
      <Box>
        <Typography variant="h6" gutterBottom>
          {t("Tips and Notes:")}
        </Typography>
        <List>
          <ListItem>
            <ListItemText
              primary={t("- Tokens can only be redeemed while the election is open.")}
            />
          </ListItem>
          <ListItem>
            <ListItemText
              primary={t("- Election configuration can be exported/imported in YAML format.")}
            />
          </ListItem>
          <ListItem>
            <ListItemText
              primary={t("- The system is auditable and secure; all critical actions are logged.")}
            />
          </ListItem>
        </List>
      </Box>
    </Container>
  );
}
