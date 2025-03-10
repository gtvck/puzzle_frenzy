import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';

// Game constants
const GRID_WIDTH = 8;
const GRID_HEIGHT = 12;
const BLOCK_SIZE = 1;
const BLOCK_SPACING = 0.1;

// Block colors
const BLOCK_COLORS = [
  0xff4444, // red
  0x44ff44, // green
  0x4444ff, // blue
  0xffff44, // yellow
  0xff44ff, // purple
  0x44ffff  // cyan
];

const GameBoard = ({ onScoreUpdate, onGameOver, difficulty = 1 }) => {
  const containerRef = useRef(null);
  const sceneRef = useRef(null);
  const cameraRef = useRef(null);
  const rendererRef = useRef(null);
  const gridRef = useRef(Array(GRID_HEIGHT).fill().map(() => Array(GRID_WIDTH).fill(null)));
  const selectedBlockRef = useRef(null);
  const animationsRef = useRef([]);
  const particlesRef = useRef([]);
  const shakeRef = useRef({ active: false, intensity: 0, duration: 0, elapsed: 0 });
  const gameStateRef = useRef({
    score: 0,
    isGameOver: false,
    dropSpeed: 1000 - (difficulty * 100), // ms between drops, adjusted by difficulty
    lastDropTime: 0,
    isProcessingMatches: false
  });
  
  const [debugInfo, setDebugInfo] = useState({ fps: 0, blockCount: 0 });

  // Initialize the game
  useEffect(() => {
    if (!containerRef.current) return;
    
    // Clear any existing content
    while (containerRef.current.firstChild) {
      containerRef.current.removeChild(containerRef.current.firstChild);
    }

    // Setup scene
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x111122);
    sceneRef.current = scene;

    // Setup camera
    const aspect = containerRef.current.clientWidth / containerRef.current.clientHeight;
    const camera = new THREE.PerspectiveCamera(40, aspect, 0.1, 1000);
    
    // Adjust camera position based on grid size to ensure everything is visible
    const gridWidthTotal = GRID_WIDTH * (BLOCK_SIZE + BLOCK_SPACING);
    const gridHeightTotal = GRID_HEIGHT * (BLOCK_SIZE + BLOCK_SPACING);
    const maxDimension = Math.max(gridWidthTotal, gridHeightTotal);
    
    // Position camera to see the entire grid
    camera.position.z = maxDimension * 1.5;
    camera.position.y = 0;
    cameraRef.current = camera;

    // Setup renderer with antialiasing for smoother edges
    const renderer = new THREE.WebGLRenderer({ 
      antialias: true,
      precision: 'highp'
    });
    renderer.setSize(containerRef.current.clientWidth, containerRef.current.clientHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    containerRef.current.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // Add lights for better block visibility
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.7);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
    directionalLight.position.set(5, 5, 10);
    scene.add(directionalLight);

    // Add grid background
    createGridBackground();
    
    // Setup initial blocks
    initializeGrid();
    
    // Setup click handler for block selection
    setupClickHandler();
    
    // Setup resize handler
    window.addEventListener('resize', handleResize);
    
    // Start game loop
    let lastTime = 0;
    let frameCounter = 0;
    let lastFpsUpdate = 0;
    
    const gameLoop = (time) => {
      const deltaTime = time - lastTime;
      lastTime = time;
      
      // FPS counter
      frameCounter++;
      if (time - lastFpsUpdate > 1000) {
        setDebugInfo(prev => ({
          ...prev, 
          fps: frameCounter,
          blockCount: countBlocks()
        }));
        frameCounter = 0;
        lastFpsUpdate = time;
      }
      
      // Process block dropping based on game speed
      if (!gameStateRef.current.isGameOver && !gameStateRef.current.isProcessingMatches) {
        if (time - gameStateRef.current.lastDropTime > gameStateRef.current.dropSpeed) {
          gameStateRef.current.lastDropTime = time;
          dropNewBlock();
        }
      }
      
      // Update animations
      updateAnimations(deltaTime);
      
      // Update particles
      updateParticles(deltaTime);
      
      // Update screen shake
      updateScreenShake(deltaTime);
      
      // Render scene
      rendererRef.current.render(sceneRef.current, cameraRef.current);
      
      // Continue loop
      requestAnimationFrame(gameLoop);
    };
    
    requestAnimationFrame(gameLoop);
    
    // Cleanup function
    return () => {
      window.removeEventListener('resize', handleResize);
      
      // Clean up Three.js resources
      if (rendererRef.current) {
        rendererRef.current.dispose();
      }
      
      // Dispose of all geometries and materials
      if (sceneRef.current) {
        sceneRef.current.traverse((object) => {
          if (object.geometry) object.geometry.dispose();
          if (object.material) {
            if (Array.isArray(object.material)) {
              object.material.forEach(material => material.dispose());
            } else {
              object.material.dispose();
            }
          }
        });
      }
      
      // Stop any ongoing animations
      animationsRef.current = [];
      particlesRef.current = [];
    };
  }, [difficulty]);

  // Count total blocks for debugging
  const countBlocks = () => {
    let count = 0;
    for (let y = 0; y < GRID_HEIGHT; y++) {
      for (let x = 0; x < GRID_WIDTH; x++) {
        if (gridRef.current[y][x]) count++;
      }
    }
    return count;
  };

  // Create grid background
  const createGridBackground = () => {
    const gridGeometry = new THREE.PlaneGeometry(
      GRID_WIDTH * (BLOCK_SIZE + BLOCK_SPACING) + BLOCK_SPACING,
      GRID_HEIGHT * (BLOCK_SIZE + BLOCK_SPACING) + BLOCK_SPACING
    );
    const gridMaterial = new THREE.MeshBasicMaterial({ 
      color: 0x222244, 
      transparent: true,
      opacity: 0.8,
    });
    const gridMesh = new THREE.Mesh(gridGeometry, gridMaterial);
    gridMesh.position.z = -0.5;
    sceneRef.current.add(gridMesh);
    
    // Add grid border
    const borderWidth = GRID_WIDTH * (BLOCK_SIZE + BLOCK_SPACING) + BLOCK_SPACING + 0.2;
    const borderHeight = GRID_HEIGHT * (BLOCK_SIZE + BLOCK_SPACING) + BLOCK_SPACING + 0.2;
    
    const borderGeometry = new THREE.EdgesGeometry(
      new THREE.BoxGeometry(borderWidth, borderHeight, 0.1)
    );
    const borderMaterial = new THREE.LineBasicMaterial({ 
      color: 0x6666cc, 
      linewidth: 3
    });
    const borderLines = new THREE.LineSegments(borderGeometry, borderMaterial);
    sceneRef.current.add(borderLines);
    
    // Add grid lines for better visibility
    const gridLinesGroup = new THREE.Group();
    
    // Vertical grid lines
    for (let x = 0; x <= GRID_WIDTH; x++) {
      const lineX = (x - GRID_WIDTH/2) * (BLOCK_SIZE + BLOCK_SPACING);
      const lineGeometry = new THREE.BufferGeometry().setFromPoints([
        new THREE.Vector3(lineX, -GRID_HEIGHT/2 * (BLOCK_SIZE + BLOCK_SPACING), -0.4),
        new THREE.Vector3(lineX, GRID_HEIGHT/2 * (BLOCK_SIZE + BLOCK_SPACING), -0.4)
      ]);
      const lineMaterial = new THREE.LineBasicMaterial({ color: 0x333355 });
      const line = new THREE.Line(lineGeometry, lineMaterial);
      gridLinesGroup.add(line);
    }
    
    // Horizontal grid lines
    for (let y = 0; y <= GRID_HEIGHT; y++) {
      const lineY = (y - GRID_HEIGHT/2) * (BLOCK_SIZE + BLOCK_SPACING);
      const lineGeometry = new THREE.BufferGeometry().setFromPoints([
        new THREE.Vector3(-GRID_WIDTH/2 * (BLOCK_SIZE + BLOCK_SPACING), lineY, -0.4),
        new THREE.Vector3(GRID_WIDTH/2 * (BLOCK_SIZE + BLOCK_SPACING), lineY, -0.4)
      ]);
      const lineMaterial = new THREE.LineBasicMaterial({ color: 0x333355 });
      const line = new THREE.Line(lineGeometry, lineMaterial);
      gridLinesGroup.add(line);
    }
    
    sceneRef.current.add(gridLinesGroup);
  };

  // Initialize the grid with some blocks
  const initializeGrid = () => {
    // Clear grid first
    for (let y = 0; y < GRID_HEIGHT; y++) {
      for (let x = 0; x < GRID_WIDTH; x++) {
        if (gridRef.current[y][x]) {
          sceneRef.current.remove(gridRef.current[y][x]);
          gridRef.current[y][x] = null;
        }
      }
    }
    
    // Fill bottom few rows with blocks
    const initialRows = 3; // Start with 3 rows of blocks
    for (let y = 0; y < initialRows; y++) {
      for (let x = 0; x < GRID_WIDTH; x++) {
        const initialY = GRID_HEIGHT - initialRows + y;
        createBlockAt(x, initialY);
      }
    }
    
    // Check initial matches and clear them if any
    const initialMatches = findMatches();
    if (initialMatches.length > 0) {
      clearMatches(initialMatches);
    }
  };
  
  // Create a block at specific grid position
  const createBlockAt = (x, y, animate = false) => {
    if (x < 0 || x >= GRID_WIDTH || y < 0 || y >= GRID_HEIGHT) {
      return null;
    }
    
    // Check if there's already a block at this position
    if (gridRef.current[y][x]) {
      return gridRef.current[y][x];
    }
    
    // Pick a random color, but avoid creating matches
    let availableColors = [...BLOCK_COLORS];
    
    // Check horizontal matches (avoid same color as 2 previous blocks horizontally)
    if (x >= 2) {
      const block1 = gridRef.current[y][x-1];
      const block2 = gridRef.current[y][x-2];
      if (block1 && block2 && block1.userData.color === block2.userData.color) {
        availableColors = availableColors.filter(c => c !== block1.userData.color);
      }
    }
    
    // Check vertical matches (avoid same color as 2 previous blocks vertically)
    if (y >= 2) {
      const block1 = gridRef.current[y-1][x];
      const block2 = gridRef.current[y-2][x];
      if (block1 && block2 && block1.userData.color === block2.userData.color) {
        availableColors = availableColors.filter(c => c !== block1.userData.color);
      }
    }
    
    // If we've filtered out all colors, just use any color
    if (availableColors.length === 0) {
      availableColors = [...BLOCK_COLORS];
    }
    
    const colorIndex = Math.floor(Math.random() * availableColors.length);
    const color = availableColors[colorIndex];
    
    // Determine if this is a special block (5% chance)
    const isSpecial = Math.random() < 0.05;
    
    // Create the block mesh
    const blockGeometry = new THREE.BoxGeometry(BLOCK_SIZE * 0.9, BLOCK_SIZE * 0.9, BLOCK_SIZE * 0.9);
    const blockMaterial = new THREE.MeshPhongMaterial({ 
      color: color,
      shininess: 70,
      specular: 0x444444
    });
    
    const block = new THREE.Mesh(blockGeometry, blockMaterial);
    
    // Set position
    const xPos = (x - GRID_WIDTH/2 + 0.5) * (BLOCK_SIZE + BLOCK_SPACING);
    let yPos;
    
    if (animate) {
      // Start position above the grid for drop animation
      yPos = ((GRID_HEIGHT + 1) - GRID_HEIGHT/2 + 0.5) * (BLOCK_SIZE + BLOCK_SPACING);
    } else {
      // Static position within grid
      yPos = (y - GRID_HEIGHT/2 + 0.5) * (BLOCK_SIZE + BLOCK_SPACING);
    }
    
    block.position.set(xPos, yPos, 0);
    
    // Add edges for better visibility
    const edges = new THREE.LineSegments(
      new THREE.EdgesGeometry(blockGeometry),
      new THREE.LineBasicMaterial({ color: 0xffffff })
    );
    block.add(edges);
    
    // Add special indicator if needed
    if (isSpecial) {
      addSpecialBlockIndicator(block);
    }
    
    // Set user data for game logic
    block.userData = {
      isBlock: true,
      gridPosition: { x, y },
      color: color,
      isSpecial: isSpecial,
      isAnimating: false
    };
    
    // Add to scene and grid reference
    sceneRef.current.add(block);
    gridRef.current[y][x] = block;
    
    // Animate drop if needed
    if (animate) {
      animateBlockDrop(block, x, y);
    }
    
    return block;
  };
  
  // Add special block indicator (star)
  const addSpecialBlockIndicator = (block) => {
    // Create star shape
    const starShape = new THREE.Shape();
    const size = 0.2;
    
    for (let i = 0; i < 10; i++) {
      const radius = i % 2 === 0 ? size : size * 0.4;
      const angle = Math.PI * i / 5;
      if (i === 0) {
        starShape.moveTo(radius * Math.cos(angle), radius * Math.sin(angle));
      } else {
        starShape.lineTo(radius * Math.cos(angle), radius * Math.sin(angle));
      }
    }
    
    const starGeometry = new THREE.ShapeGeometry(starShape);
    const starMaterial = new THREE.MeshBasicMaterial({
      color: 0xffff00,
      side: THREE.DoubleSide
    });
    
    const star = new THREE.Mesh(starGeometry, starMaterial);
    star.position.z = 0.5;
    block.add(star);
    
    // Add glow halo
    const haloGeometry = new THREE.CircleGeometry(0.3, 16);
    const haloMaterial = new THREE.MeshBasicMaterial({
      color: 0xffffaa,
      transparent: true,
      opacity: 0.3
    });
    
    const halo = new THREE.Mesh(haloGeometry, haloMaterial);
    halo.position.z = 0.45;
    block.add(halo);
    
    // Add pulsing animation
    const animation = {
      update: (deltaTime) => {
        const time = Date.now() * 0.001;
        const scale = 1 + Math.sin(time * 3) * 0.1;
        star.scale.set(scale, scale, 1);
        halo.scale.set(scale * 1.2, scale * 1.2, 1);
        halo.material.opacity = 0.3 + Math.sin(time * 3) * 0.1;
        return false; // Never complete, continuous animation
      }
    };
    
    animationsRef.current.push(animation);
  };
  
  // Animate block dropping
  const animateBlockDrop = (block, targetX, targetY) => {
    const startPos = block.position.clone();
    const endPos = new THREE.Vector3(
      (targetX - GRID_WIDTH/2 + 0.5) * (BLOCK_SIZE + BLOCK_SPACING),
      (targetY - GRID_HEIGHT/2 + 0.5) * (BLOCK_SIZE + BLOCK_SPACING),
      0
    );
    
    const startTime = Date.now();
    const duration = 500; // ms
    
    block.userData.isAnimating = true;
    
    const animation = {
      update: () => {
        const elapsed = Date.now() - startTime;
        const progress = Math.min(elapsed / duration, 1);
        
        // Easing function - bounce at the end
        let easedProgress;
        if (progress < 0.7) {
          // First 70% - accelerate down
          easedProgress = progress / 0.7;
        } else {
          // Last 30% - bounce at the end
          const bounceProgress = (progress - 0.7) / 0.3;
          easedProgress = 1 - Math.sin((1 - bounceProgress) * Math.PI * 0.5) * 0.1;
        }
        
        block.position.lerpVectors(startPos, endPos, easedProgress);
        
        if (progress >= 1) {
          block.userData.isAnimating = false;
          return true; // Animation complete
        }
        
        return false; // Animation in progress
      }
    };
    
    animationsRef.current.push(animation);
  };
  
  // Drop a new block from the top
  const dropNewBlock = () => {
    // Choose a random column
    const x = Math.floor(Math.random() * GRID_WIDTH);
    
    // Check if the column is full
    if (gridRef.current[0][x] !== null) {
      // Game over if the top row is filled
      handleGameOver();
      return;
    }
    
    // Create a new block at the top
    createBlockAt(x, 0, true);
    
    // Check for matches after the block settles
    setTimeout(() => {
      const matches = findMatches();
      if (matches.length > 0) {
        clearMatches(matches);
      }
      
      // Check for blocks that need to fall
      applyGravity();
    }, 500);
  };
  
  // Handle game over
  const handleGameOver = () => {
    if (gameStateRef.current.isGameOver) return;
    
    gameStateRef.current.isGameOver = true;
    onGameOver(gameStateRef.current.score);
  };
  
  // Setup click handler for block selection and swapping
  const setupClickHandler = () => {
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();
    
    const handleClick = (event) => {
      // Ignore clicks if game is over or processing matches
      if (gameStateRef.current.isGameOver || gameStateRef.current.isProcessingMatches) {
        return;
      }
      
      // Calculate mouse position
      const rect = rendererRef.current.domElement.getBoundingClientRect();
      mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
      
      // Cast ray
      raycaster.setFromCamera(mouse, cameraRef.current);
      const intersects = raycaster.intersectObjects(sceneRef.current.children, true);
      
      // Find the first block intersection
      for (let i = 0; i < intersects.length; i++) {
        const object = intersects[i].object;
        
        // Find the actual block (might be an edge or child object)
        let block = object;
        while (block.parent && !block.userData.isBlock) {
          block = block.parent;
        }
        
        if (block && block.userData && block.userData.isBlock) {
          handleBlockClick(block);
          break;
        }
      }
    };
    
    // Add event listener
    rendererRef.current.domElement.addEventListener('click', handleClick);
  };
  
  // Handle block click
  const handleBlockClick = (block) => {
    // Ignore if the block is currently animating
    if (block.userData.isAnimating) return;
    
    if (!selectedBlockRef.current) {
      // First block selection
      selectedBlockRef.current = block;
      highlightBlock(block);
    } else if (selectedBlockRef.current === block) {
      // Deselect if clicking the same block
      unhighlightBlock(selectedBlockRef.current);
      selectedBlockRef.current = null;
    } else {
      // Check if blocks are adjacent
      const pos1 = selectedBlockRef.current.userData.gridPosition;
      const pos2 = block.userData.gridPosition;
      
      const isAdjacent = 
        (Math.abs(pos1.x - pos2.x) === 1 && pos1.y === pos2.y) ||
        (Math.abs(pos1.y - pos2.y) === 1 && pos1.x === pos2.x);
      
      if (isAdjacent) {
        // Swap blocks
        swapBlocks(selectedBlockRef.current, block);
        
        // Clear selection
        unhighlightBlock(selectedBlockRef.current);
        selectedBlockRef.current = null;
      } else {
        // Select new block instead
        unhighlightBlock(selectedBlockRef.current);
        selectedBlockRef.current = block;
        highlightBlock(block);
      }
    }
  };
  
  // Highlight selected block
  const highlightBlock = (block) => {
    block.scale.set(1.2, 1.2, 1.2);
    
    // Add glow effect
    const glowGeometry = new THREE.BoxGeometry(
      BLOCK_SIZE * 1.2, 
      BLOCK_SIZE * 1.2, 
      BLOCK_SIZE * 1.2
    );
    const glowMaterial = new THREE.MeshBasicMaterial({
      color: 0xffffff,
      transparent: true,
      opacity: 0.3,
      wireframe: true
    });
    
    const glow = new THREE.Mesh(glowGeometry, glowMaterial);
    glow.userData.isGlow = true;
    block.add(glow);
    
    // Add pulsing animation
    const startTime = Date.now();
    
    const animation = {
      update: () => {
        const elapsed = Date.now() - startTime;
        const scale = 1.2 + Math.sin(elapsed * 0.01) * 0.05;
        
        if (block.parent) { // Check if block still exists
          block.scale.set(scale, scale, scale);
        } else {
          return true; // Block was removed, stop animation
        }
        
        return false; // Continue animation
      }
    };
    
    animationsRef.current.push(animation);
  };
  
  // Unhighlight block
  const unhighlightBlock = (block) => {
    if (!block || !block.parent) return;
    
    block.scale.set(1, 1, 1);
    
    // Remove glow effect
    block.children.forEach(child => {
      if (child.userData && child.userData.isGlow) {
        block.remove(child);
        if (child.geometry) child.geometry.dispose();
        if (child.material) child.material.dispose();
      }
    });
  };
  
  // Swap blocks
  const swapBlocks = (block1, block2) => {
    // Get positions
    const pos1 = {...block1.userData.gridPosition};
    const pos2 = {...block2.userData.gridPosition};
    
    // Prevent swapping during animations
    if (block1.userData.isAnimating || block2.userData.isAnimating) {
      return;
    }
    
    // Mark blocks as animating
    block1.userData.isAnimating = true;
    block2.userData.isAnimating = true;
    
    // Update grid reference
    gridRef.current[pos1.y][pos1.x] = block2;
    gridRef.current[pos2.y][pos2.x] = block1;
    
    // Update block userData
    block1.userData.gridPosition = {...pos2};
    block2.userData.gridPosition = {...pos1};
    
    // Animate the swap
    const startPos1 = block1.position.clone();
    const startPos2 = block2.position.clone();
    
    const endPos1 = new THREE.Vector3(
      (pos2.x - GRID_WIDTH/2 + 0.5) * (BLOCK_SIZE + BLOCK_SPACING),
      (pos2.y - GRID_HEIGHT/2 + 0.5) * (BLOCK_SIZE + BLOCK_SPACING),
      0
    );
    
    const endPos2 = new THREE.Vector3(
      (pos1.x - GRID_WIDTH/2 + 0.5) * (BLOCK_SIZE + BLOCK_SPACING),
      (pos1.y - GRID_HEIGHT/2 + 0.5) * (BLOCK_SIZE + BLOCK_SPACING),
      0
    );
    
    const startTime = Date.now();
    const duration = 300; // ms
    
    const animation = {
      update: () => {
        const elapsed = Date.now() - startTime;
        const progress = Math.min(elapsed / duration, 1);
        const smoothT = progress * (2 - progress); // easing function
        
        block1.position.lerpVectors(startPos1, endPos1, smoothT);
        block2.position.lerpVectors(startPos2, endPos2, smoothT);
        
        if (progress >= 1) {
          block1.userData.isAnimating = false;
          block2.userData.isAnimating = false;
          
          // Check for matches after swap
          const matches = findMatches();
          
          if (matches.length > 0) {
            // Valid swap - clear matches
            clearMatches(matches);
          } else {
            // Invalid swap - swap back
            swapBlocksBack(block1, block2, pos1, pos2);
          }
          
          return true; // Animation complete
        }
        
        return false; // Animation in progress
      }
    };
    
    animationsRef.current.push(animation);
  };
  
  // Swap blocks back if no match
  const swapBlocksBack = (block1, block2, pos1, pos2) => {
    // Update grid reference back
    gridRef.current[pos1.y][pos1.x] = block1;
    gridRef.current[pos2.y][pos2.x] = block2;
    
    // Update block userData back
    block1.userData.gridPosition = {...pos1};
    block2.userData.gridPosition = {...pos2};
    
    // Mark blocks as animating
    block1.userData.isAnimating = true;
    block2.userData.isAnimating = true;
    
    // Animate the swap back
    const startPos1 = block1.position.clone();
    const startPos2 = block2.position.clone();
    
    const endPos1 = new THREE.Vector3(
      (pos1.x - GRID_WIDTH/2 + 0.5) * (BLOCK_SIZE + BLOCK_SPACING),
      (pos1.y - GRID_HEIGHT/2 + 0.5) * (BLOCK_SIZE + BLOCK_SPACING),
      0
    );
    
    const endPos2 = new THREE.Vector3(
      (pos2.x - GRID_WIDTH/2 + 0.5) * (BLOCK_SIZE + BLOCK_SPACING),
      (pos2.y - GRID_HEIGHT/2 + 0.5) * (BLOCK_SIZE + BLOCK_SPACING),
      0
    );
    
    const startTime = Date.now();
    const duration = 200; // ms, faster than the initial swap
    
    const animation = {
      update: () => {
        const elapsed = Date.now() - startTime;
        const progress = Math.min(elapsed / duration, 1);
        const smoothT = progress * (2 - progress); // easing function
        
        block1.position.lerpVectors(startPos1, endPos1, smoothT);
        block2.position.lerpVectors(startPos2, endPos2, smoothT);
        
        if (progress >= 1) {
          block1.userData.isAnimating = false;
          block2.userData.isAnimating = false;
          return true; // Animation complete
        }
        
        return false; // Animation in progress
      }
    };
    
    animationsRef.current.push(animation);
  };
  
  // Find matching blocks
  const findMatches = () => {
    const matches = new Set();
    
    // Check horizontal matches
    for (let y = 0; y < GRID_HEIGHT; y++) {
      let matchColor = null;
      let matchLength = 1;
      let matchStart = 0;
      
      for (let x = 0; x < GRID_WIDTH; x++) {
        const block = gridRef.current[y][x];
        
        if (block && matchColor === block.userData.color) {
          // Continue current match
          matchLength++;
          
          // If we have 3 or more and we're at the end of the row
          if (matchLength >= 3 && x === GRID_WIDTH - 1) {
            // Add all blocks in the match
            for (let i = 0; i < matchLength; i++) {
              matches.add(gridRef.current[y][x - i]);
            }
          }
        } else {
          // End of a potential match
          if (matchLength >= 3) {
            // Add all blocks in the match
            for (let i = 0; i < matchLength; i++) {
              matches.add(gridRef.current[y][x - 1 - i]);
            }
          }
          
          // Start a new potential match
          matchColor = block ? block.userData.color : null;
          matchLength = block ? 1 : 0;
          matchStart = x;
        }
      }
    }
    
    // Check vertical matches
    for (let x = 0; x < GRID_WIDTH; x++) {
      let matchColor = null;
      let matchLength = 1;
      let matchStart = 0;
      
      for (let y = 0; y < GRID_HEIGHT; y++) {
        const block = gridRef.current[y][x];
        
        if (block && matchColor === block.userData.color) {
          // Continue current match
          matchLength++;
          
          // If we have 3 or more and we're at the end of the column
          if (matchLength >= 3 && y === GRID_HEIGHT - 1) {
            // Add all blocks in the match
            for (let i = 0; i < matchLength; i++) {
              matches.add(gridRef.current[y - i][x]);
            }
          }
        } else {
          // End of a potential match
          if (matchLength >= 3) {
            // Add all blocks in the match
            for (let i = 0; i < matchLength; i++) {
              matches.add(gridRef.current[y - 1 - i][x]);
            }
          }
          
          // Start a new potential match
          matchColor = block ? block.userData.color : null;
          matchLength = block ? 1 : 0;
          matchStart = y;
        }
      }
    }
    
    return Array.from(matches);
  };
  
  // Clear matching blocks
  const clearMatches = (matches) => {
    if (matches.length === 0) return;
    
    gameStateRef.current.isProcessingMatches = true;
    
    // Calculate points based on number of matches and special blocks
    let points = matches.length * 10; // Base points
    let specialBlocksCount = 0;
    
    // Count special blocks for bonus points
    matches.forEach(block => {
      if (block.userData.isSpecial) {
        specialBlocksCount++;
        points += 20; // Bonus for special blocks
      }
    });
    
    // Update score
    gameStateRef.current.score += points;
    onScoreUpdate(points);
    
    // Calculate center position for explosion
    let centerX = 0, centerY = 0;
    matches.forEach(block => {
      centerX += block.position.x;
      centerY += block.position.y;
    });
    centerX /= matches.length;
    centerY /= matches.length;
    
    // Create explosion at center
    createExplosion(new THREE.Vector3(centerX, centerY, 0), 0xffffff, 50 + specialBlocksCount * 10);
    
    // Create explosion at each block with staggered timing
    matches.forEach((block, index) => {
      setTimeout(() => {
        // Create explosion
        createExplosion(block.position.clone(), block.userData.color, block.userData.isSpecial ? 30 : 20);
        
        // Get position before removing
        const x = block.userData.gridPosition.x;
        const y = block.userData.gridPosition.y;
        
        // Remove from grid
        gridRef.current[y][x] = null;
        
        // Animate removal
        animateBlockRemoval(block);
      }, index * 50); // Stagger by 50ms
    });
    
    // Apply gravity after all blocks are removed
    setTimeout(() => {
      startScreenShake(0.2, 300);
      applyGravity();
      gameStateRef.current.isProcessingMatches = false;
    }, matches.length * 50 + 300);
  };
  
  // Animate block removal with effects
  const animateBlockRemoval = (block) => {
    const startTime = Date.now();
    const duration = 300; // ms
    
    const animation = {
      update: () => {
        const elapsed = Date.now() - startTime;
        const progress = Math.min(elapsed / duration, 1);
        
        // Scale down and rotate
        const scale = 1 - progress;
        block.scale.set(scale, scale, scale);
        
        // Add rotation for more dynamic effect
        block.rotation.x += 0.1;
        block.rotation.y += 0.1;
        block.rotation.z += 0.1;
        
        if (progress >= 1) {
          // Remove block from scene
          if (block.parent) {
            sceneRef.current.remove(block);
          }
          
          // Dispose of geometries and materials
          block.traverse(child => {
            if (child.geometry) child.geometry.dispose();
            if (child.material) {
              if (Array.isArray(child.material)) {
                child.material.forEach(material => material.dispose());
              } else {
                child.material.dispose();
              }
            }
          });
          
          return true; // Animation complete
        }
        
        return false; // Animation in progress
      }
    };
    
    animationsRef.current.push(animation);
  };
  
  // Apply gravity to make blocks fall into empty spaces
  const applyGravity = () => {
    let blocksMoving = false;
    
    // Process from bottom to top, right to left
    for (let y = GRID_HEIGHT - 2; y >= 0; y--) {
      for (let x = 0; x < GRID_WIDTH; x++) {
        const block = gridRef.current[y][x];
        
        if (block) {
          // Check how far this block can fall
          let fallDistance = 0;
          for (let checkY = y + 1; checkY < GRID_HEIGHT; checkY++) {
            if (gridRef.current[checkY][x] === null) {
              fallDistance++;
            } else {
              break;
            }
          }
          
          if (fallDistance > 0) {
            blocksMoving = true;
            
            // Calculate new position
            const newY = y + fallDistance;
            
            // Update grid reference
            gridRef.current[y][x] = null;
            gridRef.current[newY][x] = block;
            
            // Update block data
            block.userData.gridPosition = { x, y: newY };
            
            // Animate falling
            animateBlockFall(block, x, newY);
          }
        }
      }
    }
    
    // Fill empty columns at the top
    for (let x = 0; x < GRID_WIDTH; x++) {
      let emptyCount = 0;
      
      // Count empty spaces in this column
      for (let y = 0; y < GRID_HEIGHT; y++) {
        if (gridRef.current[y][x] === null) {
          emptyCount++;
        }
      }
      
      // Create new blocks at the top if needed
      if (emptyCount > 0) {
        for (let i = 0; i < emptyCount; i++) {
          // Start from the top and work down
          const y = i;
          if (gridRef.current[y][x] === null) {
            createBlockAt(x, y, true);
            blocksMoving = true;
          }
        }
      }
    }
    
    // Check for new matches after gravity
    if (blocksMoving) {
      setTimeout(() => {
        const newMatches = findMatches();
        if (newMatches.length > 0) {
          clearMatches(newMatches);
        }
      }, 500); // Wait for animations to complete
    }
  };
  
  // Animate block falling
  const animateBlockFall = (block, x, newY) => {
    const startPos = block.position.clone();
    const endPos = new THREE.Vector3(
      (x - GRID_WIDTH/2 + 0.5) * (BLOCK_SIZE + BLOCK_SPACING),
      (newY - GRID_HEIGHT/2 + 0.5) * (BLOCK_SIZE + BLOCK_SPACING),
      0
    );
    
    const startTime = Date.now();
    const duration = 300; // ms
    
    block.userData.isAnimating = true;
    
    const animation = {
      update: () => {
        const elapsed = Date.now() - startTime;
        const progress = Math.min(elapsed / duration, 1);
        
        // Easing function for smoother fall
        const easedProgress = progress * (2 - progress);
        
        block.position.lerpVectors(startPos, endPos, easedProgress);
        
        if (progress >= 1) {
          block.userData.isAnimating = false;
          return true; // Animation complete
        }
        
        return false; // Animation in progress
      }
    };
    
    animationsRef.current.push(animation);
  };
  
  // Create explosion particle effect
  const createExplosion = (position, color, count = 20) => {
    // Start screen shake
    startScreenShake(count > 30 ? 0.3 : 0.15, 300);
    
    // Create bright flash
    const flashGeometry = new THREE.CircleGeometry(1, 32);
    const flashMaterial = new THREE.MeshBasicMaterial({
      color: 0xffffff,
      transparent: true,
      opacity: 0.8
    });
    const flash = new THREE.Mesh(flashGeometry, flashMaterial);
    flash.position.copy(position);
    flash.position.z = 0.2;
    sceneRef.current.add(flash);
    
    // Fade out flash
    const flashStartTime = Date.now();
    const flashDuration = 200;
    
    const flashAnimation = {
      update: () => {
        const elapsed = Date.now() - flashStartTime;
        if (elapsed < flashDuration) {
          const progress = elapsed / flashDuration;
          flash.material.opacity = 0.8 * (1 - progress);
          flash.scale.set(1 + progress, 1 + progress, 1);
          return false;
        } else {
          sceneRef.current.remove(flash);
          flash.material.dispose();
          flash.geometry.dispose();
          return true;
        }
      }
    };
    
    animationsRef.current.push(flashAnimation);
    
    // Create particles
    for (let i = 0; i < count; i++) {
      const size = Math.random() * 0.2 + 0.05;
      
      // Randomize particle shape
      let geometry;
      const shapeType = Math.floor(Math.random() * 3);
      
      if (shapeType === 0) {
        geometry = new THREE.BoxGeometry(size, size, size);
      } else if (shapeType === 1) {
        geometry = new THREE.SphereGeometry(size/2, 8, 8);
      } else {
        geometry = new THREE.TetrahedronGeometry(size/2);
      }
      
      // Create glowing material
      const material = new THREE.MeshPhongMaterial({
        color: color,
        emissive: color,
        emissiveIntensity: 0.5,
        transparent: true,
        opacity: 1
      });
      
      const particle = new THREE.Mesh(geometry, material);
      particle.position.copy(position);
      
      // Random velocity
      const speed = Math.random() * 0.2 + 0.05;
      const angle = Math.random() * Math.PI * 2;
      const height = Math.random() * 0.3 + 0.1;
      
      particle.userData = {
        velocity: new THREE.Vector3(
          Math.cos(angle) * speed,
          Math.sin(angle) * speed,
          height
        ),
        spin: new THREE.Vector3(
          (Math.random() - 0.5) * 0.3,
          (Math.random() - 0.5) * 0.3,
          (Math.random() - 0.5) * 0.3
        ),
        gravity: -0.01,
        life: 1.0,
        decay: Math.random() * 0.03 + 0.01,
        startTime: Date.now()
      };
      
      sceneRef.current.add(particle);
      particlesRef.current.push(particle);
    }
  };
  
  // Update particles
  const updateParticles = (deltaTime) => {
    const deadParticles = [];
    
    particlesRef.current.forEach((particle, index) => {
      // Update position
      particle.position.x += particle.userData.velocity.x;
      particle.position.y += particle.userData.velocity.y;
      particle.position.z += particle.userData.velocity.z;
      
      // Apply gravity
      particle.userData.velocity.z += particle.userData.gravity;
      
      // Add spin
      particle.rotation.x += particle.userData.spin.x;
      particle.rotation.y += particle.userData.spin.y;
      particle.rotation.z += particle.userData.spin.z;
      
      // Reduce life
      particle.userData.life -= particle.userData.decay;
      
      // Update opacity and scale
      particle.material.opacity = particle.userData.life;
      const scale = Math.max(0.1, particle.userData.life);
      particle.scale.set(scale, scale, scale);
      
      // Check if particle is dead
      if (particle.userData.life <= 0) {
        deadParticles.push(index);
        sceneRef.current.remove(particle);
        
        // Dispose of geometry and material
        particle.geometry.dispose();
        particle.material.dispose();
      }
    });
    
    // Remove dead particles (in reverse order to avoid index issues)
    for (let i = deadParticles.length - 1; i >= 0; i--) {
      particlesRef.current.splice(deadParticles[i], 1);
    }
  };
  
  // Start screen shake effect
  const startScreenShake = (intensity = 0.2, duration = 500) => {
    shakeRef.current = {
      active: true,
      intensity,
      duration,
      startTime: Date.now()
    };
  };
  
  // Update screen shake
  const updateScreenShake = (deltaTime) => {
    if (!shakeRef.current.active) return;
    
    const elapsed = Date.now() - shakeRef.current.startTime;
    
    if (elapsed >= shakeRef.current.duration) {
      // Reset shake
      shakeRef.current.active = false;
      cameraRef.current.position.y = 0;
      cameraRef.current.position.x = 0;
      return;
    }
    
    // Calculate remaining intensity based on elapsed time
    const remainingIntensity = shakeRef.current.intensity * (1 - elapsed / shakeRef.current.duration);
    
    // Apply shake to camera
    const offsetX = (Math.random() * 2 - 1) * remainingIntensity;
    const offsetY = (Math.random() * 2 - 1) * remainingIntensity;
    
    cameraRef.current.position.x = offsetX;
    cameraRef.current.position.y = offsetY;
  };
  
  // Update animations
  const updateAnimations = (deltaTime) => {
    const completedAnimations = [];
    
    animationsRef.current.forEach((animation, index) => {
      if (animation.update(deltaTime)) {
        completedAnimations.push(index);
      }
    });
    
    // Remove completed animations (in reverse order to avoid index issues)
    for (let i = completedAnimations.length - 1; i >= 0; i--) {
      animationsRef.current.splice(completedAnimations[i], 1);
    }
  };
  
  // Handle window resize
  const handleResize = () => {
    if (!containerRef.current || !cameraRef.current || !rendererRef.current) return;
    
    const width = containerRef.current.clientWidth;
    const height = containerRef.current.clientHeight;
    
    cameraRef.current.aspect = width / height;
    cameraRef.current.updateProjectionMatrix();
    
    rendererRef.current.setSize(width, height);
  };
  
  return (
    <div 
      ref={containerRef}
      className="w-full max-w-6xl bg-gray-800 rounded-lg overflow-hidden shadow-xl border-4 border-gray-700"
      style={{ 
        minHeight: '500px', 
        height: '70vh', 
        maxHeight: '800px',
        boxShadow: '0 0 20px rgba(0, 0, 255, 0.3)' 
      }}
    >
      {/* Optional debug info */}
      {/*
      <div className="absolute top-2 left-2 bg-black bg-opacity-50 text-white text-xs p-1 rounded">
        FPS: {debugInfo.fps} | Blocks: {debugInfo.blockCount}
      </div>
      */}
    </div>
  );
};

export default GameBoard;