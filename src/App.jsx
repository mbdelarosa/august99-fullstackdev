import axios from "axios";
import { useEffect, useState } from "react";
import PropTypes from "prop-types";

import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import CardMedia from "@mui/material/CardMedia";
import CircularProgress from "@mui/material/CircularProgress";
import Container from "@mui/material/Container";
import CssBaseline from "@mui/material/CssBaseline";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import { ThemeProvider, createTheme } from "@mui/material/styles";

import defaultImage from "./assets/default-img.png";

const theme = createTheme({
  palette: {
    background: {
      default: "#f5f5f5",
    },
  },
});

const SearchBar = ({ handleInput }) => {
  const [draft, setDraft] = useState("");

  const handleChange = (e) => {
    setDraft(e.target.value);
  };

  const handleEnter = (e) => {
    if (e.key == "Enter") {
      handleInput(draft);
    }
  };

  return (
    <TextField
      fullWidth
      placeholder="Enter keywords"
      variant="outlined"
      sx={{
        "& .MuiInputBase-input": {
          backgroundColor: "white",
          fontStyle: "italic",
        },
      }}
      onChange={handleChange}
      onKeyPress={handleEnter}
    />
  );
};

SearchBar.propTypes = {
  handleInput: PropTypes.func,
};

const Launch = ({ launch }) => {
  const launch_year = new Date("2015-02-11T23:03:00.000Z").getFullYear();
  return (
    <Card
      elevation={0}
      sx={{
        padding: "0.5rem",
      }}
    >
      <CardContent
        sx={{
          display: "flex",
          gap: "1rem",
        }}
      >
        <CardMedia
          component="img"
          image={
            launch.links.flickr.original.length > 0
              ? launch.links.flickr.original[0]
              : defaultImage
          }
          alt={`Launch ${launch.name}`}
          sx={{
            width: "6rem",
            borderRadius: "2px",
          }}
        />
        <Box display="flex" flexDirection="column" gap="0.5rem">
          <Typography variant="h6" component="h2">
            Flight {launch.flight_number}: Mission {launch.name} ({launch_year})
          </Typography>
          <Typography
            variant="body1"
            color="gray"
            sx={{
              overflow: "hidden",
              textOverflow: "ellipsis",
              display: "-webkit-box",
              WebkitLineClamp: "3",
              WebkitBoxOrient: "vertical",
            }}
          >
            Details: {launch.details ? launch.details : "-"}
          </Typography>
        </Box>
      </CardContent>
    </Card>
  );
};

Launch.propTypes = {
  launch: PropTypes.object,
};

const DisplayLaunches = ({ isLoading, launches, hasNextPage }) => {
  return (
    <Container
      sx={{
        p: { xs: "0.5rem", md: "2rem" },
        backgroundColor: "white",
        border: "1px solid #0000003b",
        borderRadius: "0.25rem",
      }}
    >
      {launches.map((launch) => (
        <Launch
          key={launch.flight_number.toString() + launch.name}
          launch={launch}
        />
      ))}
      {isLoading ? (
        <Box display="flex" justifyContent="center">
          <CircularProgress color="inherit" />
        </Box>
      ) : (
        <></>
      )}
      {hasNextPage ? (
        <></>
      ) : (
        <Box display="flex" justifyContent="center">
          <p>🚀 You have viewed all launches!</p>
        </Box>
      )}
    </Container>
  );
};

DisplayLaunches.propTypes = {
  isLoading: PropTypes.bool,
  launches: PropTypes.array,
  hasNextPage: PropTypes.bool,
};

function App() {
  const [keywords, setKeywords] = useState("");
  const [isLoading, setLoading] = useState(true);
  const [launches, setLaunches] = useState([]);
  const [page, setPage] = useState(1);
  const [hasNextPage, setHasNextPage] = useState(true);

  useEffect(() => {
    getLaunches();
  }, [page, keywords]);

  const getLaunches = async () => {
    setLoading(true);
    let payload = {
      options: {
        page: page,
      },
    };
    if (keywords.length > 0) {
      payload["query"] = {
        $text: {
          $search: keywords,
        },
      };
    }
    const { data } = await axios.post(
      `https://api.spacexdata.com/v4/launches/query`,
      payload,
    );
    setLaunches([...launches, ...data["docs"]]);
    setHasNextPage(data["hasNextPage"]);
    setLoading(false);
  };

  const onScroll = () => {
    const scrollTop = document.documentElement.scrollTop;
    const scrollHeight = document.documentElement.scrollHeight;
    const clientHeight = document.documentElement.clientHeight;

    if (scrollTop + clientHeight >= scrollHeight) {
      setPage(page + 1);
    }
  };

  useEffect(() => {
    if (hasNextPage) {
      window.addEventListener("scroll", onScroll);
      return () => window.removeEventListener("scroll", onScroll);
    }
  }, [launches]);

  const handleInput = (input) => {
    setLaunches([]);
    setKeywords(input);
    setPage(1);
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Container
        disableGutters
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          minHeight: "100vh",
        }}
      >
        <Container
          sx={{
            my: "3rem",
            display: "flex",
            flexDirection: "column",
            gap: "2rem",
          }}
        >
          <SearchBar handleInput={handleInput} />
          <DisplayLaunches
            isLoading={isLoading}
            launches={launches}
            hasNextPage={hasNextPage}
          />
        </Container>
      </Container>
    </ThemeProvider>
  );
}

export default App;
