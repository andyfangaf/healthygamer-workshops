import React, { useEffect, useState } from "react";
import { signIn, signOut, useSession } from "next-auth/client";
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
  Divider,
  IconButton,
  Card,
  CardHeader,
  CardContent,
  Chip,
} from "@material-ui/core";
import Skeleton from "@material-ui/lab/Skeleton";
import { FaDiscord, FaGithub } from "react-icons/fa";
import { MdClose } from "react-icons/md";
import Link from "next/link";
import { gql, useApolloClient } from "@apollo/client";

export default function Home() {
  const [session, loading] = useSession();
  const [toastOpen, setToastOpen] = useState(false);
  const [descriptionValue, setDescriptionValue] = useState("");
  const [applicationsData, setApplicationsData] = useState([]);
  const [applicationsDataLoading, setApplicationsDataLoading] = useState(true);
  const [sendApplicationLoading, setSendApplicationLoading] = useState(false);
  const client = useApolloClient();

  useEffect(() => {
    if (!session) {
      return;
    }

    const showApps = async () => {
      const { data, loading } = await client.query({
        query: SHOW_APPLICATIONS,
        variables: { user: session.user.name },
      });

      setApplicationsData(data.applications);
      setApplicationsDataLoading(loading);
    };

    showApps();
  }, [loading]);

  if (loading) {
    return <LinearProgress />;
  }

  const submitApp = async () => {
    // TODO: Use error boundaries
    try {
      const { data } = await client.mutate({
        mutation: CREATE_APPLICATION,
        variables: {
          user: session.user.name,
          description: descriptionValue,
        },
      });
      setApplicationsData([
        ...applicationsData,
        ...data.insert_applications.returning,
      ]);
      setToastOpen(true);
    } catch (error) {
      // TODO: Add error handling
      alert(error);
    }
  };

  const AppForm = session ? (
    <Grid container direction="column" spacing={2}>
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

  const handleApplicationDelete = (id: string) => {
    return async () => {
      try {
        await client.mutate({
          mutation: DELETE_APPLICATION,
          variables: {
            id,
          },
        });
        setApplicationsData(applicationsData.filter((data) => data.id !== id));
      } catch (error) {
        alert(error);
      }
    };
  };

  const AvatarMarkup = <Avatar src={session.user.image}></Avatar>;
  const SkeletonCardMarkup = new Array(3).fill(null).map((_, i) => (
    <Grid item key={`SkeletonCard-${i}`}>
      <Card>
        <CardHeader>
          <Skeleton variant="rect" width={210} height={118} />
        </CardHeader>
        <CardContent>
          <Skeleton />
          <Skeleton width="60%" />
        </CardContent>
      </Card>
    </Grid>
  ));

  return (
    <Container maxWidth="xs">
      <Grid container direction="column" spacing={3}>
        <Grid item>
          {!session && (
            <>
              <Box mb={2}>
                <Typography variant="h4">HealthyGamer Coaching</Typography>
              </Box>
              <Button
                onClick={() => signIn("discord")}
                color="primary"
                variant="contained"
                startIcon={<FaDiscord />}
              >
                Login with Discord
              </Button>
              <Box mt={2}>
                <Link href="https://github.com/fandy/healthygamer-workshops/tree/main/1-coaching-app">
                  <Button startIcon={<FaGithub />}>Source code</Button>
                </Link>
              </Box>
            </>
          )}

          {session && (
            <Grid container item justify="space-between" alignItems="center">
              <Grid item>
                <Grid container alignItems="center" spacing={1}>
                  <Grid item>{AvatarMarkup}</Grid>
                  <Grid item>
                    <Typography>{session.user.name}</Typography>
                  </Grid>
                </Grid>
              </Grid>
              <Grid item>
                <Button onClick={() => signOut()} size="large">
                  Logout
                </Button>
              </Grid>
            </Grid>
          )}
        </Grid>

        {AppForm}

        <Grid item>
          <Divider />
        </Grid>

        <Grid item>
          <Typography variant="h6">My applications</Typography>
          <Grid container direction="column" spacing={2}>
            {applicationsDataLoading ? SkeletonCardMarkup : null}
            {applicationsData.length === 0 ? (
              <Grid item>
                <Typography>No applications from you yet</Typography>
              </Grid>
            ) : null}

            {applicationsData.map(({ id, description }, i) => {
              return (
                <Grid item key={`Application-${i}`}>
                  <Card>
                    <CardHeader
                      title={<Chip color="default" label="Pending"></Chip>}
                      action={
                        <IconButton
                          size="small"
                          onClick={handleApplicationDelete(id)}
                        >
                          <MdClose />
                        </IconButton>
                      }
                    ></CardHeader>
                    <CardContent>
                      <Typography>{description}</Typography>
                    </CardContent>
                  </Card>
                </Grid>
              );
            })}
          </Grid>
        </Grid>

        <Grid item>
          <Typography variant="h6">My sessions</Typography>
          <Typography>Coming soon on the next workshop...</Typography>
        </Grid>
      </Grid>

      <Snackbar
        open={toastOpen}
        onClose={() => setToastOpen(false)}
        message="Success! Your coach will reach out to you soon."
      />
    </Container>
  );
}

const CREATE_APPLICATION = gql`
  mutation CreateApplication($description: String, $user: String) {
    insert_applications(objects: { description: $description, user: $user }) {
      returning {
        id
        description
      }
    }
  }
`;

const DELETE_APPLICATION = gql`
  mutation DeleteApplication($id: uuid) {
    delete_applications(where: { id: { _eq: $id } }) {
      returning {
        id
        description
      }
    }
  }
`;

const SHOW_APPLICATIONS = gql`
  query ShowApplications($user: String) {
    applications(where: { user: { _eq: $user } }) {
      id
      description
    }
  }
`;
