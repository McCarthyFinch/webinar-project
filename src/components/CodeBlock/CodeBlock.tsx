'use client';

import { useState } from 'react';
import styles from './CodeBlock.module.css';

type CodeBlockProps = {
  code: string;
  language: string;
};

type ExecutionError = Error & {
  message: string;
};

export default function CodeBlock({ code, language }: CodeBlockProps) {
  const [output, setOutput] = useState<string>('');
  const [isRunning, setIsRunning] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const executeCode = async () => {
    setIsRunning(true);
    setError(null);
    setOutput('');

    try {
      const consoleOutput: string[] = [];
      
      // Create a mock console.log
      const originalConsoleLog = console.log;
      console.log = (...args) => {
        consoleOutput.push(args.map(arg => 
          typeof arg === 'string' ? arg : JSON.stringify(arg)
        ).join(' '));
      };

      switch (language) {
        case 'javascript':
        case 'js':
          try {
            // Execute the code directly
            await eval(code);
          } catch (error) {
            const execError = error as ExecutionError;
            throw new Error(`JavaScript execution error: ${execError.message}`);
          }
          break;

        case 'python':
          throw new Error('Python execution requires backend support - coming soon!');
          break;

        default:
          throw new Error(`Language '${language}' is not supported yet.`);
      }

      // Restore original console.log
      console.log = originalConsoleLog;

      // Set the output
      setOutput(consoleOutput.join('\n'));
    } catch (error) {
      const execError = error as ExecutionError;
      setError(execError.message);
    } finally {
      setIsRunning(false);
    }
  };

  return (
    <div className={styles.codeBlockContainer}>
      <div className={styles.codeHeader}>
        <span className={styles.language}>{language}</span>
        <button
          className={styles.runButton}
          onClick={executeCode}
          disabled={isRunning}
        >
          {isRunning ? 'Running...' : 'Run Code'}
        </button>
      </div>
      <pre className={styles.codeBlock}>
        <code>{code}</code>
      </pre>
      {(output || error) && (
        <div className={styles.output}>
          <div className={styles.outputHeader}>Output:</div>
          <pre className={`${styles.outputContent} ${error ? styles.error : ''}`}>
            {error || output || 'No output'}
          </pre>
        </div>
      )}
    </div>
  );
} 