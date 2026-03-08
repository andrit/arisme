import Link from "next/link";
import { Typography, Container, Box } from "@mui/material";

export default function Home() {
  return(
    <Container>
      <Box className="introduction">
        <Typography variant="h1" component="h1" gutterBottom>Hi, My Name is Andrew.</Typography>
        {/* <Typography variant="h4" gutterBottom>but you can call me Andy</Typography> */}
        <Typography variant="h2" gutterBottom>I am a creative technologist</Typography>
        <p>I am a Fullstack Web Developer focusing on Javascript technologies like React, redux, Fastify, & NextJS
        </p>
        <p>I also enjoy photography, film, creative writing & complexity.</p>
      </Box>

    <Box className="mypath">

    <Typography variant="h3" gutterBottom>I have come a long way to get to where I am now
      </Typography>
      <p>Almost 20 years ago I went back to school for Design. 
      </p>
      <p>Along the way I have held many different roles.</p>
      <ul>
        <li>full stack web developer</li>
        <li>front end web engineer</li>
        <li>Wordpress theme developer</li>
        <li>graphic designer</li>
        <li>photographer</li>
        <li>videographer</li>
        <li>creative writer</li>
      </ul>
    </Box>

    <Box className="skills">
      <Typography variant="h4" gutterBottom>Along the way I have accumulated many different skills</Typography>
    </Box>
    </Container>
    

  )
}