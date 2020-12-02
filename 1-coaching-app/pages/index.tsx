import React from "react";
import {
  providers,
  SessionProvider,
  signIn,
  signOut,
  useSession,
} from "next-auth/client";
import {
  Container,
  Box,
  Button,
  TextField,
  LinearProgress,
  Grid,
} from "@material-ui/core";
import { FaDiscord } from "react-icons/fa";

interface Props {
  providers: SessionProvider;
}

export default function Home({ providers }: Props) {
  const [session, loading] = useSession();

  const AppForm = (
    <>
      <Grid item>
        <TextField
          label="Description"
          multiline
          variant="outlined"
          placeholder="What would you like your coach to know? E.g. feeling stuck in life"
        ></TextField>
      </Grid>
      <Grid item>
        <Button color="primary" variant="contained">
          Register for coaching
        </Button>
      </Grid>
    </>
  );

  if (loading) {
    return <LinearProgress />;
  }

  return (
    <Container>
      <Grid container direction="column" spacing={2}>
        <Grid item>
          {!session &&
            Object.values(providers).map((provider) => (
              <div key={provider.name}>
                <Button
                  onClick={() => signIn(provider.id)}
                  color="primary"
                  variant="contained"
                  startIcon={<FaDiscord />}
                >
                  Login with {provider.name}
                </Button>
              </div>
            ))}

          {session && (
            <Button onClick={() => signOut()} size="large">
              Logout
            </Button>
          )}
        </Grid>

        {session && AppForm}
      </Grid>
    </Container>
  );
}

Home.getInitialProps = async (context) => {
  // providers is incorrectly typed in the library, so we're disabling it here.
  return {
    providers: await (providers as any)(context),
  };
};
