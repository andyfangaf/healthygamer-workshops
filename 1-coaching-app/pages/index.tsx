import React, { useState } from "react";
import {
  providers,
  SessionProvider,
  signIn,
  signOut,
  useSession,
} from "next-auth/client";
import {
  Container,
  Button,
  TextField,
  LinearProgress,
  Grid,
  Avatar,
  Typography,
  Snackbar,
} from "@material-ui/core";
import { FaDiscord } from "react-icons/fa";
import { NextPageContext } from "next";

interface Props {
  providers: SessionProvider;
}

export default function Home({ providers }: Props) {
  const [session, loading] = useSession();
  const [toastOpen, setToastOpen] = useState(false);
  const [descriptionValue, setDescriptionValue] = useState("");

  if (loading) {
    return <LinearProgress />;
  }

  const submitApp = () => {
    setToastOpen(true);
    return;
  };

  const AppForm = session ? (
    <Grid container direction="column" spacing={2}>
      <Grid item>
        <Grid container alignItems="center" spacing={1}>
          <Grid item>
            <Avatar src={session.user.image}></Avatar>
          </Grid>
          <Grid item>
            <Typography>{session.user.name}</Typography>
          </Grid>
        </Grid>
      </Grid>
      <Grid item>
        <TextField
          label="Description"
          multiline
          variant="outlined"
          placeholder="What would you like your coach to know? E.g. feeling stuck in life"
          value={descriptionValue}
          onChange={(event) => setDescriptionValue(event.target.value)}
          fullWidth
        ></TextField>
      </Grid>
      <Grid item>
        <Button
          color="primary"
          variant="contained"
          onClick={submitApp}
          disabled={descriptionValue === ""}
          fullWidth
          size="large"
        >
          Register for coaching
        </Button>
      </Grid>
    </Grid>
  ) : null;

  console.log(providers);
  return (
    <>
      <Container maxWidth="xs">
        <Grid container direction="column" spacing={2}>
          <Grid item>
            {!session && (
              <Button
                onClick={() => signIn("discord")}
                color="primary"
                variant="contained"
                startIcon={<FaDiscord />}
              >
                Login with Discord
              </Button>
            )}

            {session && (
              <Button onClick={() => signOut()} size="large">
                Logout
              </Button>
            )}
          </Grid>

          {AppForm}
        </Grid>

        <Snackbar
          open={toastOpen}
          onClose={() => setToastOpen(false)}
          message="Success! Your coach will reach out to you soon."
        />
      </Container>
    </>
  );
}

Home.getInitialProps = async (context: NextPageContext) => {
  // providers is incorrectly typed in the library, so we're disabling it here.
  return {
    providers: await (providers as any)(context),
  };
};
