const http = require('http');

const data = JSON.stringify({
  topic: 'Newton Laws',
  subject: 'Physics',
  answers: [0, 0, 0, 0, 0],
  questions: [
    { question: 'Q1', options: ['A','B','C','D'], correct: 0, explanation: 'Exp 1' },
    { question: 'Q2', options: ['A','B','C','D'], correct: 1, explanation: 'Exp 2' },
    { question: 'Q3', options: ['A','B','C','D'], correct: 0, explanation: 'Exp 3' },
    { question: 'Q4', options: ['A','B','C','D'], correct: 1, explanation: 'Exp 4' },
    { question: 'Q5', options: ['A','B','C','D'], correct: 0, explanation: 'Exp 5' }
  ]
});

const options = {
  hostname: 'localhost',
  port: 3000,
  path: '/quiz/submit',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': data.length,
    // Need a session cookie for requireAuth. 
  }
};

// Instead of HTTP, let's write a script that connects to MongoDB and inserts directly
// to see if we hit a Mongoose validation error.
