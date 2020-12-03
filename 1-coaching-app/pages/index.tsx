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
  Box,
  CircularProgress,
} from "@material-ui/core";
import { FaDiscord } from "react-icons/fa";
import { NextPageContext } from "next";
import { useMutation, gql } from "@apollo/client";

interface Props {
  providers: SessionProvider;
}

export default function Home({ providers }: Props) {
  const [session, loading] = useSession();
  const [toastOpen, setToastOpen] = useState(false);
  const [descriptionValue, setDescriptionValue] = useState("");
  const [sendApplication, { loading: sendApplicationLoading }] = useMutation(
    CREATE_APPLICATION_MUTATION
  );

  if (loading) {
    return <LinearProgress />;
  }

  const submitApp = async () => {
    try {
      await sendApplication({
        variables: {
          user: session.user.name,
          description: descriptionValue,
        },
      });
    } catch (error) {
      // TODO: Add error handling
      alert(error);
    }

    setToastOpen(true);
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
          disabled={descriptionValue === "" || sendApplicationLoading}
          fullWidth
          size="large"
        >
          {sendApplicationLoading ? (
            <CircularProgress size={24} />
          ) : (
            "Register for coaching"
          )}
        </Button>
      </Grid>
    </Grid>
  ) : null;

  return (
    <>
      <Container maxWidth="xs">
        <Grid container direction="column" spacing={2}>
          <Grid item>
            {!session && (
              <>
                <Box mb={2}>
                  <Typography variant="h2">HealthyGamer Coaching</Typography>
                </Box>
                <Button
                  onClick={() => signIn("discord")}
                  color="primary"
                  variant="contained"
                  startIcon={<FaDiscord />}
                >
                  Login with Discord
                </Button>
              </>
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

const CREATE_APPLICATION_MUTATION = gql`
  mutation CreateApplicationMutation($description: String, $user: String) {
    insert_applications(objects: { description: $description, user: $user }) {
      returning {
        id
      }
    }
  }
`;
