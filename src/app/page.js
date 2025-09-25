"use client";

import Link from "next/link";
import {
  Box,
  Button,
  Card,
  CardContent,
  Container,
  Grid,
  Typography,
} from "@mui/material";

export default function Home() {
  return (
    <Box>
      <Box className="animated-gradient"
        sx={{
          position: "relative",
          py: { xs: 8, md: 12 },
          color: "white",
          overflow: "hidden",
        }}
      >
        <Container>
          <Typography variant="h2" fontWeight={700} gutterBottom>
            Mutual Fund Explorer
          </Typography>
          <Typography variant="h6" sx={{ opacity: 0.9, maxWidth: 720 }} gutterBottom>
            Discover funds, visualize NAV history, and calculate SIP returns with
            interactive charts backed by MFAPI.in.
          </Typography>
          <Box sx={{ display: "flex", gap: 2, mt: 3, flexWrap: "wrap" }}>
            <Button component={Link} href="/funds" variant="contained" color="secondary">
              Explore Funds
            </Button>
            <Button component={Link} href="/scheme/118834" variant="outlined" sx={{ color: "white", borderColor: "white" }}>
              Try a Sample Scheme
            </Button>
          </Box>
        </Container>
        <Box sx={{
          position: "absolute", right: -120, top: -120, width: 360, height: 360,
          bgcolor: "white", opacity: 0.08, borderRadius: "50%",
          filter: "blur(2px)",
        }} />
      </Box>

      <Container sx={{ py: 6 }}>
        <Grid container spacing={3}>
          <Grid item xs={12} md={4}>
            <Card variant="outlined" sx={{ transition: "transform .2s", '&:hover': { transform: 'translateY(-4px)' } }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>Search & Browse</Typography>
                <Typography variant="body2" color="text.secondary">
                  Filter by scheme name and explore grouped fund houses and categories.
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={4}>
            <Card variant="outlined" sx={{ transition: "transform .2s", '&:hover': { transform: 'translateY(-4px)' } }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>Charts & Insights</Typography>
                <Typography variant="body2" color="text.secondary">
                  View 1-year NAV history and calculated returns (1m, 3m, 6m, 1y).
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={4}>
            <Card variant="outlined" sx={{ transition: "transform .2s", '&:hover': { transform: 'translateY(-4px)' } }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>SIP Calculator</Typography>
                <Typography variant="body2" color="text.secondary">
                  Simulate monthly investments and see growth and annualized returns.
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        <Box sx={{ display: 'flex', gap: 2, mt: 4 }}>
          <Button component={Link} href="/funds" variant="contained">Get Started</Button>
          <Button component={Link} href="/scheme/118834" variant="text">Quick Demo</Button>
        </Box>
      </Container>
    </Box>
  );
}
