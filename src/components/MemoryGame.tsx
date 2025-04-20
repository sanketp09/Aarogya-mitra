import React, { useState, useEffect } from 'react';
import { Dices, RefreshCw, Target, X, Circle, Calculator } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

const GamesCollection = () => {
  const [activeGame, setActiveGame] = useState('memory');
  
  // Memory Game State
  const [memoryCards, setMemoryCards] = useState([]);
  const [flippedCards, setFlippedCards] = useState([]);
  const [memoryGameStarted, setMemoryGameStarted] = useState(false);
  const [matches, setMatches] = useState(0);
  const [moves, setMoves] = useState(0);
  const emoji = ['🍎', '🍐', '🍊', '🍋', '🍌', '🍉', '🍇', '🍓', '🫐', '🍒', '🍑', '🥭'];
  
  // Tic Tac Toe State
  const [board, setBoard] = useState(Array(9).fill(null));
  const [currentPlayer, setCurrentPlayer] = useState('X');
  const [winner, setWinner] = useState(null);
  
  // Math Quiz State
  const [questions, setQuestions] = useState([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [quizFinished, setQuizFinished] = useState(false);
  
  // Hangman State
  const [hangmanState, setHangmanState] = useState({
    word: '',
    guessedLetters: [],
    remainingAttempts: 6,
    status: 'playing'
  });
  const words = ['JAVASCRIPT', 'REACT', 'COMPONENT', 'FUNCTION', 'VARIABLE', 'INTERFACE', 'TYPESCRIPT'];
  
  // Mock toast function since we can't import the real one
  const toast = (params) => {
    console.log("Toast:", params.title, params.description);
  };
  
  // Initialize Memory Game
  const initializeMemoryGame = () => {
    // Select 8 random emoji for 16 cards (pairs)
    const randomEmoji = [...emoji].sort(() => 0.5 - Math.random()).slice(0, 8);
    
    // Create pairs and shuffle
    const cardPairs = [...randomEmoji, ...randomEmoji];
    const shuffledCards = cardPairs
      .sort(() => Math.random() - 0.5)
      .map((content, index) => ({
        id: index,
        content,
        flipped: false,
        matched: false
      }));
      
    setMemoryCards(shuffledCards);
    setFlippedCards([]);
    setMatches(0);
    setMoves(0);
    setMemoryGameStarted(true);
  };
  
  // Handle Memory Card Click
  const handleCardClick = (id) => {
    if (flippedCards.length === 2 || memoryCards[id].flipped || memoryCards[id].matched) {
      return;
    }

    const newCards = [...memoryCards];
    newCards[id].flipped = true;
    setMemoryCards(newCards);
    
    const newFlippedCards = [...flippedCards, id];
    setFlippedCards(newFlippedCards);
    
    if (newFlippedCards.length === 2) {
      setMoves(moves + 1);
      
      const [firstId, secondId] = newFlippedCards;
      if (memoryCards[firstId].content === memoryCards[secondId].content) {
        // Match found
        setTimeout(() => {
          const matchedCards = [...memoryCards];
          matchedCards[firstId].matched = true;
          matchedCards[secondId].matched = true;
          setMemoryCards(matchedCards);
          setFlippedCards([]);
          setMatches(matches + 1);
          
          if (matches + 1 === memoryCards.length / 2) {
            toast({
              title: "Congratulations!",
              description: `You completed the memory game in ${moves + 1} moves!`,
              duration: 5000
            });
          }
        }, 500);
      } else {
        // No match
        setTimeout(() => {
          const resetCards = [...memoryCards];
          resetCards[firstId].flipped = false;
          resetCards[secondId].flipped = false;
          setMemoryCards(resetCards);
          setFlippedCards([]);
        }, 1000);
      }
    }
  };
  
  // Tic Tac Toe Logic
  const checkWinner = (boardState) => {
    const winPatterns = [
      [0, 1, 2], [3, 4, 5], [6, 7, 8], // Rows
      [0, 3, 6], [1, 4, 7], [2, 5, 8], // Columns
      [0, 4, 8], [2, 4, 6]             // Diagonals
    ];
    
    for (const pattern of winPatterns) {
      const [a, b, c] = pattern;
      if (boardState[a] && boardState[a] === boardState[b] && boardState[a] === boardState[c]) {
        return boardState[a];
      }
    }
    
    // Check for draw
    if (boardState.every(cell => cell !== null)) {
      return 'Draw';
    }
    
    return null;
  };
  
  const handleCellClick = (index) => {
    if (board[index] || winner) return;
    
    const newBoard = [...board];
    newBoard[index] = currentPlayer;
    setBoard(newBoard);
    
    const gameWinner = checkWinner(newBoard);
    if (gameWinner) {
      setWinner(gameWinner);
      toast({
        title: "Game Over!",
        description: gameWinner !== 'Draw' ? `Player ${gameWinner} wins!` : "It's a draw!",
        duration: 3000
      });
    } else {
      setCurrentPlayer(currentPlayer === 'X' ? 'O' : 'X');
    }
  };
  
  const resetTicTacToe = () => {
    setBoard(Array(9).fill(null));
    setCurrentPlayer('X');
    setWinner(null);
  };
  
  // Math Quiz Logic
  const generateQuestions = () => {
    const newQuestions = [];
    
    for (let i = 0; i < 5; i++) {
      const operation = Math.floor(Math.random() * 3);
      let num1, num2, answer, question;
      
      switch (operation) {
        case 0: // Addition
          num1 = Math.floor(Math.random() * 50) + 1;
          num2 = Math.floor(Math.random() * 50) + 1;
          answer = num1 + num2;
          question = `${num1} + ${num2} = ?`;
          break;
        case 1: // Subtraction
          num1 = Math.floor(Math.random() * 50) + 51;
          num2 = Math.floor(Math.random() * 50) + 1;
          answer = num1 - num2;
          question = `${num1} - ${num2} = ?`;
          break;
        case 2: // Multiplication
          num1 = Math.floor(Math.random() * 12) + 1;
          num2 = Math.floor(Math.random() * 12) + 1;
          answer = num1 * num2;
          question = `${num1} × ${num2} = ?`;
          break;
      }
      
      // Generate options
      let options = [answer];
      while (options.length < 4) {
        const option = answer + Math.floor(Math.random() * 10) - 5;
        if (option !== answer && !options.includes(option) && option >= 0) {
          options.push(option);
        }
      }
      
      // Shuffle options
      options = options.sort(() => Math.random() - 0.5);
      
      newQuestions.push({ question, answer, options });
    }
    
    setQuestions(newQuestions);
    setCurrentQuestionIndex(0);
    setScore(0);
    setQuizFinished(false);
  };
  
  const handleAnswerSelection = (selectedAnswer) => {
    const isCorrect = selectedAnswer === questions[currentQuestionIndex].answer;
    
    if (isCorrect) {
      setScore(score + 1);
    }
    
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    } else {
      setQuizFinished(true);
      toast({
        title: "Quiz Completed!",
        description: `Your score: ${isCorrect ? score + 1 : score} out of ${questions.length}`,
        duration: 5000
      });
    }
  };
  
  // Hangman Logic
  const initializeHangman = () => {
    const randomWord = words[Math.floor(Math.random() * words.length)];
    setHangmanState({
      word: randomWord,
      guessedLetters: [],
      remainingAttempts: 6,
      status: 'playing'
    });
  };
  
  const handleLetterGuess = (letter) => {
    if (hangmanState.status !== 'playing' || hangmanState.guessedLetters.includes(letter)) {
      return;
    }
    
    const newGuessedLetters = [...hangmanState.guessedLetters, letter];
    const isCorrectGuess = hangmanState.word.includes(letter);
    const newRemainingAttempts = isCorrectGuess 
      ? hangmanState.remainingAttempts 
      : hangmanState.remainingAttempts - 1;
    
    // Check if all letters of the word have been guessed
    const isWordGuessed = [...hangmanState.word].every(char => 
      newGuessedLetters.includes(char)
    );
    
    // Determine game status
    let newStatus = hangmanState.status;
    if (isWordGuessed) {
      newStatus = 'won';
      toast({
        title: "Congratulations!",
        description: `You guessed the word: ${hangmanState.word}`,
        duration: 5000
      });
    } else if (newRemainingAttempts === 0) {
      newStatus = 'lost';
      toast({
        title: "Game Over!",
        description: `The word was: ${hangmanState.word}`,
        duration: 5000
      });
    }
    
    setHangmanState({
      ...hangmanState,
      guessedLetters: newGuessedLetters,
      remainingAttempts: newRemainingAttempts,
      status: newStatus
    });
  };
  
  // Initialize games when tab changes
  useEffect(() => {
    if (activeGame === 'memory' && !memoryGameStarted) {
      initializeMemoryGame();
    } else if (activeGame === 'tictactoe') {
      resetTicTacToe();
    } else if (activeGame === 'mathquiz' && questions.length === 0) {
      generateQuestions();
    } else if (activeGame === 'hangman' && hangmanState.word === '') {
      initializeHangman();
    }
  }, [activeGame]);
  
  // Initialize memory game on component load
  useEffect(() => {
    initializeMemoryGame();
  }, []);

  return (
    <div className="container mx-auto px-4 py-6 max-w-4xl">
      <div className="flex justify-center items-center mb-6">
        <h1 className="text-3xl font-bold">Game Center</h1>
      </div>
      
      <Tabs value={activeGame} onValueChange={setActiveGame} className="w-full">
        <TabsList className="grid grid-cols-4 w-full">
          <TabsTrigger value="memory" className="flex items-center gap-2">
            <Dices className="h-4 w-4" /> Memory
          </TabsTrigger>
          <TabsTrigger value="tictactoe" className="flex items-center gap-2">
            <Target className="h-4 w-4" /> Tic Tac Toe
          </TabsTrigger>
          <TabsTrigger value="mathquiz" className="flex items-center gap-2">
            <Calculator className="h-4 w-4" /> Math Quiz
          </TabsTrigger>
          <TabsTrigger value="hangman" className="flex items-center gap-2">
            <RefreshCw className="h-4 w-4" /> Hangman
          </TabsTrigger>
        </TabsList>
        
        {/* Memory Game */}
        <TabsContent value="memory" className="mt-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Memory Game</CardTitle>
              <Button onClick={initializeMemoryGame} variant="outline" size="sm">
                <RefreshCw className="mr-2 h-4 w-4" /> Restart
              </Button>
            </CardHeader>
            <CardContent>
              <div className="bg-slate-100 p-4 rounded-lg shadow text-center mb-6">
                <div className="flex justify-center gap-8 text-lg">
                  <div>
                    <span className="font-semibold">Moves:</span> {moves}
                  </div>
                  <div>
                    <span className="font-semibold">Matches:</span> {matches} of {memoryCards.length / 2}
                  </div>
                </div>
              </div>
              
              <div className="grid grid-cols-4 gap-2">
                {memoryCards.map((card) => (
                  <div
                    key={card.id}
                    className={`aspect-square flex items-center justify-center text-2xl rounded-lg shadow cursor-pointer transition-all duration-300 ${
                      card.flipped || card.matched
                        ? "bg-white rotate-0"
                        : "bg-blue-500 text-white"
                    } ${card.matched ? "bg-green-100" : ""} hover:scale-105`}
                    onClick={() => handleCardClick(card.id)}
                  >
                    {card.flipped || card.matched ? card.content : "?"}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Tic Tac Toe Game */}
        <TabsContent value="tictactoe" className="mt-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Tic Tac Toe</CardTitle>
              <Button onClick={resetTicTacToe} variant="outline" size="sm">
                <RefreshCw className="mr-2 h-4 w-4" /> New Game
              </Button>
            </CardHeader>
            <CardContent>
              <div className="bg-slate-100 p-4 rounded-lg shadow text-center mb-6">
                {winner ? (
                  <p className="text-lg font-semibold">
                    {winner === 'Draw' ? "It's a Draw!" : `Player ${winner} wins!`}
                  </p>
                ) : (
                  <p className="text-lg font-semibold">
                    Current Player: <span className="font-bold">{currentPlayer}</span>
                  </p>
                )}
              </div>
              
              <div className="grid grid-cols-3 gap-2 max-w-md mx-auto">
                {board.map((cell, index) => (
                  <div
                    key={index}
                    className="aspect-square flex items-center justify-center text-3xl font-bold bg-white rounded-lg shadow cursor-pointer hover:bg-slate-50"
                    onClick={() => handleCellClick(index)}
                  >
                    {cell === 'X' && <X className="text-blue-500 h-10 w-10" />}
                    {cell === 'O' && <Circle className="text-red-500 h-10 w-10" />}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Math Quiz Game */}
        <TabsContent value="mathquiz" className="mt-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Math Quiz</CardTitle>
              <Button onClick={generateQuestions} variant="outline" size="sm">
                <RefreshCw className="mr-2 h-4 w-4" /> New Quiz
              </Button>
            </CardHeader>
            <CardContent>
              {questions.length > 0 && !quizFinished ? (
                <div className="space-y-4">
                  <div className="bg-slate-100 p-4 rounded-lg shadow text-center mb-6">
                    <div className="flex justify-between items-center">
                      <div className="text-lg">
                        <span className="font-semibold">Question:</span> {currentQuestionIndex + 1}/{questions.length}
                      </div>
                      <div className="text-lg">
                        <span className="font-semibold">Score:</span> {score}
                      </div>
                    </div>
                  </div>
                  
                  <div className="text-2xl font-semibold text-center mb-6">
                    {questions[currentQuestionIndex]?.question}
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    {questions[currentQuestionIndex]?.options.map((option, idx) => (
                      <Button
                        key={idx}
                        variant="outline"
                        className="p-4 text-lg"
                        onClick={() => handleAnswerSelection(option)}
                      >
                        {option}
                      </Button>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="text-center p-12">
                  <h3 className="text-2xl font-semibold mb-4">
                    {quizFinished 
                      ? `Quiz Complete! Final Score: ${score}/${questions.length}`
                      : "Ready to test your math skills?"}
                  </h3>
                  <Button onClick={generateQuestions} size="lg">
                    {quizFinished ? "Try Again" : "Start Quiz"}
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Hangman Game */}
        <TabsContent value="hangman" className="mt-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Hangman</CardTitle>
              <Button onClick={initializeHangman} variant="outline" size="sm">
                <RefreshCw className="mr-2 h-4 w-4" /> New Word
              </Button>
            </CardHeader>
            <CardContent>
              <div className="bg-slate-100 p-4 rounded-lg shadow text-center mb-6">
                <div className="text-lg">
                  <span className="font-semibold">Attempts Remaining:</span> {hangmanState.remainingAttempts}
                </div>
              </div>
              
              <div className="flex justify-center gap-2 mb-8">
                {hangmanState.word.split('').map((letter, index) => (
                  <div
                    key={index}
                    className="w-8 h-12 border-b-2 border-black flex items-center justify-center text-2xl font-bold"
                  >
                    {hangmanState.guessedLetters.includes(letter) || hangmanState.status === 'lost' ? letter : ''}
                  </div>
                ))}
              </div>
              
              {hangmanState.status === 'playing' ? (
                <div className="grid grid-cols-7 gap-2 max-w-lg mx-auto">
                  {'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('').map(letter => (
                    <Button
                      key={letter}
                      variant={hangmanState.guessedLetters.includes(letter) ? "ghost" : "outline"}
                      className={`h-12 ${hangmanState.guessedLetters.includes(letter) ? 
                        (hangmanState.word.includes(letter) ? "bg-green-100" : "bg-red-100") : ""}`}
                      disabled={hangmanState.guessedLetters.includes(letter)}
                      onClick={() => handleLetterGuess(letter)}
                    >
                      {letter}
                    </Button>
                  ))}
                </div>
              ) : (
                <div className="text-center p-4">
                  <p className="text-xl font-semibold mb-4">
                    {hangmanState.status === 'won' 
                      ? "Congratulations! You won!" 
                      : `Game over! The word was: ${hangmanState.word}`}
                  </p>
                  <Button onClick={initializeHangman}>Play Again</Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default GamesCollection;