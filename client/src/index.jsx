import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';

// Google Translate + React DOM Fix
// This prevents React from crashing when Google Translate's DOM manipulation 
// puts nodes in unexpected places (e.g., when a re-render is triggered).
if (typeof Node !== 'undefined' && Node.prototype) {
  const originalRemoveChild = Node.prototype.removeChild;
  Node.prototype.removeChild = function (child) {
    if (child.parentNode !== this) {
      if (console) {
        console.warn('DOM Fix: Prevented removal of child from a different parent. This typically happens with Google Translate.', child, this);
      }
      return child;
    }
    return originalRemoveChild.apply(this, [child]);
  };

  const originalInsertBefore = Node.prototype.insertBefore;
  Node.prototype.insertBefore = function (newNode, referenceNode) {
    if (referenceNode && referenceNode.parentNode !== this) {
      if (console) {
        console.warn('DOM Fix: Prevented insertion before a reference node from a different parent. This typically happens with Google Translate.', newNode, referenceNode, this);
      }
      return newNode;
    }
    return originalInsertBefore.apply(this, [newNode, referenceNode]);
  };
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
