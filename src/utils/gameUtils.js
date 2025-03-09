import * as THREE from 'three';

// Color definitions
const COLORS = {
  RED: 0xff4444,
  BLUE: 0x4444ff,
  GREEN: 0x44ff44,
  YELLOW: 0xffff44,
  PURPLE: 0xff44ff,
  CYAN: 0x44ffff,
  ORANGE: 0xff8844,
  LIME: 0x88ff44,
  PINK: 0xff88aa
};

const COLOR_ARRAY = Object.values(COLORS);

// Generate a block with the given position
export function generateBlock(x, y, blockSize, blockSpacing, gridWidth, gridHeight, isSpecial = false) {
  // Pick a random color
  const colorIndex = Math.floor(Math.random() * COLOR_ARRAY.length);
  const color = COLOR_ARRAY[colorIndex];
  
  // Create block geometry with slightly rounded corners
  const blockGeometry = new THREE.BoxGeometry(blockSize, blockSize, blockSize, 1, 1, 1);
  
  // Material with pixel aesthetic
  const blockMaterial = new THREE.MeshStandardMaterial({
    color: color,
    roughness: 0.6,
    metalness: 0.2,
    flatShading: true
  });
  
  const blockMesh = new THREE.Mesh(blockGeometry, blockMaterial);
  
  // Add pixel-like edge
  const edgeGeometry = new THREE.EdgesGeometry(blockGeometry);
  const edgeMaterial = new THREE.LineBasicMaterial({ 
    color: new THREE.Color(color).multiplyScalar(0.7), 
    linewidth: 2
  });
  const edges = new THREE.LineSegments(edgeGeometry, edgeMaterial);
  blockMesh.add(edges);
  
  // If it's a special block, add an effect
  if (isSpecial) {
    // Create a simple sprite material for glow
    const spriteMaterial = new THREE.SpriteMaterial({ 
      color: new THREE.Color(color).multiplyScalar(1.5),
      transparent: true,
      opacity: 0.7
    });
    const sprite = new THREE.Sprite(spriteMaterial);
    sprite.scale.set(1.2, 1.2, 1);
    blockMesh.add(sprite);
    
    // Add a pulsing animation reference
    blockMesh.userData.pulseEffect = true;
    blockMesh.userData.pulseTime = Math.random() * Math.PI * 2; // random starting phase
  }
  
  // Calculate position based on grid coordinates
  const xPos = (x - gridWidth/2 + 0.5) * (blockSize + blockSpacing);
  const yPos = (y - gridHeight/2 + 0.5) * (blockSize + blockSpacing);
  
  blockMesh.position.set(xPos, yPos, 0);
  
  // Add userData for game logic
  blockMesh.userData.isBlock = true;
  blockMesh.userData.color = color;
  blockMesh.userData.gridPosition = { x, y };
  blockMesh.userData.isAnimating = false;
  blockMesh.userData.isSpecial = isSpecial;
  
  return blockMesh;
}

// Check for matching blocks
export function checkMatches(grid, gridWidth, gridHeight) {
  const matchedBlocks = new Set();
  
  // Check horizontal matches
  for (let y = 0; y < gridHeight; y++) {
    let currentColor = null;
    let matchLength = 1;
    let matchingBlocks = [];
    
    for (let x = 0; x < gridWidth; x++) {
      const block = grid[y][x];
      
      if (block && block.userData && block.userData.color === currentColor) {
        matchLength++;
        matchingBlocks.push(block);
        
        // If we have a match of 3 or more and we're at the end of a row
        if (matchLength >= 3 && (x === gridWidth - 1 || x === gridWidth - 1)) {
          matchingBlocks.forEach(block => matchedBlocks.add(block));
        }
      } else {
        // If we've accumulated a match of 3 or more
        if (matchLength >= 3) {
          matchingBlocks.forEach(block => matchedBlocks.add(block));
        }
        
        // Reset for the next potential match
        currentColor = block ? block.userData.color : null;
        matchLength = 1;
        matchingBlocks = block ? [block] : [];
      }
    }
  }
  
  // Check vertical matches
  for (let x = 0; x < gridWidth; x++) {
    let currentColor = null;
    let matchLength = 1;
    let matchingBlocks = [];
    
    for (let y = 0; y < gridHeight; y++) {
      const block = grid[y][x];
      
      if (block && block.userData && block.userData.color === currentColor) {
        matchLength++;
        matchingBlocks.push(block);
        
        // If we have a match of 3 or more and we're at the end of a column
        if (matchLength >= 3 && (y === gridHeight - 1 || y === gridHeight - 1)) {
          matchingBlocks.forEach(block => matchedBlocks.add(block));
        }
      } else {
        // If we've accumulated a match of 3 or more
        if (matchLength >= 3) {
          matchingBlocks.forEach(block => matchedBlocks.add(block));
        }
        
        // Reset for the next potential match
        currentColor = block ? block.userData.color : null;
        matchLength = 1;
        matchingBlocks = block ? [block] : [];
      }
    }
  }
  
  return Array.from(matchedBlocks);
}

// Apply gravity to make blocks fall into empty spaces
export function applyGravity(gridRef, gridWidth, gridHeight, blockSize, blockSpacing, animationsRef, sceneRef, onComplete) {
  let blocksMoved = false;
  
  // Start from bottom row and work up
  for (let y = 1; y < gridHeight; y++) {
    for (let x = 0; x < gridWidth; x++) {
      const block = gridRef.current[y][x];
      
      if (block !== null) {
        // Check how far this block can fall
        let fallDistance = 0;
        for (let checkY = y - 1; checkY >= 0; checkY--) {
          if (gridRef.current[checkY][x] === null) {
            fallDistance++;
          } else {
            break;
          }
        }
        
        if (fallDistance > 0) {
          // Calculate new position
          const newY = y - fallDistance;
          
          // Update grid reference
          gridRef.current[y][x] = null;
          gridRef.current[newY][x] = block;
          
          // Create falling animation
          const startTime = Date.now();
          const duration = 300; // ms
          
          block.userData.isAnimating = true;
          
          const startPos = { ...block.position };
          const endPos = {
            x: (x - gridWidth/2 + 0.5) * (blockSize + blockSpacing),
            y: (newY - gridHeight/2 + 0.5) * (blockSize + blockSpacing),
            z: 0
          };
          
          // Update grid position in the block's userData
          block.userData.gridPosition = { x, y: newY };
          
          const animation = {
            update: () => {
              const elapsed = Date.now() - startTime;
              const progress = Math.min(elapsed / duration, 1);
              
              // Smooth animation with easing
              const easeProgress = 1 - Math.pow(1 - progress, 3); // Cubic ease out
              
              block.position.x = startPos.x + (endPos.x - startPos.x) * easeProgress;
              block.position.y = startPos.y + (endPos.y - startPos.y) * easeProgress;
              
              if (progress >= 1) {
                block.userData.isAnimating = false;
                return true; // Animation complete
              }
              
              return false; // Animation in progress
            }
          };
          
          animationsRef.current.push(animation);
          blocksMoved = true;
        }
      }
    }
  }
  
  // Call the completion callback if blocks moved
  if (blocksMoved) {
    setTimeout(onComplete, 300);
  }
  
  return blocksMoved;
}

// Create a floating score effect
export function createScorePopup(score, position, scene, animationsRef) {
  // Create a text sprite with the score
  const canvas = document.createElement('canvas');
  const context = canvas.getContext('2d');
  canvas.width = 128;
  canvas.height = 64;
  
  context.fillStyle = '#ffff00';
  context.font = 'bold 36px monospace';
  context.textAlign = 'center';
  context.textBaseline = 'middle';
  context.fillText(`+${score}`, canvas.width / 2, canvas.height / 2);
  
  const texture = new THREE.CanvasTexture(canvas);
  const material = new THREE.SpriteMaterial({ 
    map: texture,
    transparent: true,
    opacity: 1
  });
  
  const sprite = new THREE.Sprite(material);
  sprite.scale.set(3, 1.5, 1);
  sprite.position.copy(position);
  
  scene.add(sprite);
  
  // Create animation
  const startTime = Date.now();
  const duration = 1500; // ms
  
  const animation = {
    update: () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      
      sprite.position.y += 0.02;
      sprite.material.opacity = 1 - progress;
      
      if (progress >= 1) {
        // Remove the sprite when animation is done
        scene.remove(sprite);
        sprite.material.dispose();
        texture.dispose();
        return true; // Animation complete
      }
      
      return false; // Animation in progress
    }
  };
  
  animationsRef.current.push(animation);
}