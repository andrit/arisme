import React, { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet';
import '../styles/index.css';

function Index() {
  const [date, setDate] = useState(null);
  useEffect(() => {
    async function getDate() {
      const res = await fetch('/api/date');
      const newDate = await res.text();
      setDate(newDate);
    }
    getDate();
  }, []);
  return (
    <main>
      <Helmet>
        <title>Gatsby + Node.js (TypeScript) API</title>
      </Helmet>
      <h1>Hi, my name is Andrew Ritter</h1>
      <h2>I am a creative technologist
      </h2>
      <p>For work: I am a fullstack web developer focusing on javascript technologies like React, redux, Express, & NextJS
      </p>
      <p>I also dabble in photography, film, creative writing & complexity.</p>
     
      <br />
      <h3>The future of the web and its interfacing is also very interesting to me.</h3>
      <p>One of the projects I am working on in this regard is to learn Rust while programming a small collection of Raspberry Pi's to act as my home "Hyperspace".</p>
    </main>
  );
}

export default Index;
