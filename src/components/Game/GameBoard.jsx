import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

// Game constants
const GRID_WIDTH = 8;
const GRID_HEIGHT = 8;
const BLOCK_SIZE = 1;
const BLOCK_SPACING = 0.1;

const GameBoard = ({ onScoreUpdate, onGameOver, difficulty }) => {
  const containerRef = useRef(null);
  const sceneRef = useRef(null);
  const cameraRef = useRef(null);
  const rendererRef = useRef(null);
  const gridRef = useRef(Array(GRID_HEIGHT).fill().map(() => Array(GRID_WIDTH).fill(null)));
  const selectedBlockRef = useRef(null);
  const requestRef = useRef(null);
  const particlesRef = useRef([]);
  const shakeRef = useRef({ active: false, intensity: 0, duration: 0, elapsed: 0 });
  const lockInteractionRef = useRef(false);

  // Fixed block colors
  const BLOCK_COLORS = [
    0xff4444, // red
    0x44ff44, // green
    0x4444ff, // blue
    0xffff44, // yellow
    0xff44ff, // purple
    0x44ffff  // cyan
  ];

  // Initialize the game
  useEffect(() => {
    console.log("GameBoard mounting");
    
    if (!containerRef.current) return;

    // Setup scene
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x111122);
    sceneRef.current = scene;

    // Setup camera
    const camera = new THREE.PerspectiveCamera(
      40, 
      containerRef.current.clientWidth / containerRef.current.clientHeight,
      0.1,
      1000
    );
    camera.position.z = 13;
    cameraRef.current = camera;

    // Camera's original position for shake effect
    const cameraOriginalPosition = camera.position.clone();

    // Setup renderer
    const renderer = new THREE.WebGLRenderer({ 
      antialias: true,
      precision: 'highp'
    });
    renderer.setSize(containerRef.current.clientWidth, containerRef.current.clientHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    
    // Clear container
    while (containerRef.current.firstChild) {
      containerRef.current.removeChild(containerRef.current.firstChild);
    }
    
    containerRef.current.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // Add lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.7);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
    directionalLight.position.set(5, 5, 10);
    scene.add(directionalLight);

    // Add grid background
    const gridGeometry = new THREE.PlaneGeometry(
      GRID_WIDTH * (BLOCK_SIZE + BLOCK_SPACING) + BLOCK_SPACING + 1,
      GRID_HEIGHT * (BLOCK_SIZE + BLOCK_SPACING) + BLOCK_SPACING + 1
    );
    const gridMaterial = new THREE.MeshBasicMaterial({ 
      color: 0x222244, 
      transparent: true,
      opacity: 0.8,
    });
    const gridMesh = new THREE.Mesh(gridGeometry, gridMaterial);
    gridMesh.position.z = -0.5;
    scene.add(gridMesh);

    // Add grid border
    const borderGeometry = new THREE.EdgesGeometry(new THREE.BoxGeometry(
      GRID_WIDTH * (BLOCK_SIZE + BLOCK_SPACING) + BLOCK_SPACING + 0.5,
      GRID_HEIGHT * (BLOCK_SIZE + BLOCK_SPACING) + BLOCK_SPACING + 0.5,
      0.1
    ));
    const borderMaterial = new THREE.LineBasicMaterial({ 
      color: 0x6666cc, 
      linewidth: 3,
    });
    const borderLines = new THREE.LineSegments(borderGeometry, borderMaterial);
    scene.add(borderLines);

    // Setup initial blocks
    setupBlocks();

    // Setup click handler
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();

    const handleClick = (event) => {
      // Don't process clicks during animations
      if (lockInteractionRef.current) {
        return;
      }
      
      // Calculate mouse position
      const rect = renderer.domElement.getBoundingClientRect();
      mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
      
      // Cast ray
      raycaster.setFromCamera(mouse, camera);
      
      // Find grid position by creating a plane at z=0 and finding intersection
      const plane = new THREE.Plane(new THREE.Vector3(0, 0, 1), 0);
      const intersection = new THREE.Vector3();
      raycaster.ray.intersectPlane(plane, intersection);
      
      // Convert intersection to grid coordinates
      const gridX = Math.floor((intersection.x + (GRID_WIDTH * (BLOCK_SIZE + BLOCK_SPACING)) / 2) / (BLOCK_SIZE + BLOCK_SPACING));
      const gridY = Math.floor((intersection.y + (GRID_HEIGHT * (BLOCK_SIZE + BLOCK_SPACING)) / 2) / (BLOCK_SIZE + BLOCK_SPACING));
      
      // Check if coordinates are valid and there's a block there
      if (gridX >= 0 && gridX < GRID_WIDTH && gridY >= 0 && gridY < GRID_HEIGHT) {
        const clickedBlock = gridRef.current[gridY][gridX];
        if (clickedBlock) {
          handleBlockClick(clickedBlock);
        }
      }
    };

    // Add event listeners
    renderer.domElement.addEventListener('click', handleClick);
    
    // Handle window resize
    const handleResize = () => {
      if (!containerRef.current) return;
      
      const width = containerRef.current.clientWidth;
      const height = containerRef.current.clientHeight;
      
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      
      renderer.setSize(width, height);
    };
    
    window.addEventListener('resize', handleResize);

    // Screen shake function
    function startScreenShake(intensity = 0.2, duration = 500) {
      shakeRef.current = {
        active: true,
        intensity,
        duration,
        elapsed: 0,
        startTime: Date.now()
      };
      
      // Add DOM shake effect to container
      if (containerRef.current) {
        containerRef.current.style.transition = 'transform 0.05s ease-in-out';
      }
    }

    // Update screen shake
    function updateScreenShake(deltaTime) {
      if (!shakeRef.current.active || !containerRef.current) return;
      
      const currentTime = Date.now();
      const elapsed = currentTime - shakeRef.current.startTime;
      
      if (elapsed >= shakeRef.current.duration) {
        // Reset shake
        shakeRef.current.active = false;
        camera.position.copy(cameraOriginalPosition);
        containerRef.current.style.transform = 'translate(0px, 0px)';
        return;
      }
      
      // Calculate remaining intensity based on elapsed time
      const remainingIntensity = shakeRef.current.intensity * (1 - elapsed / shakeRef.current.duration);
      
      // Apply shake to camera
      const offsetX = (Math.random() * 2 - 1) * remainingIntensity;
      const offsetY = (Math.random() * 2 - 1) * remainingIntensity;
      
      camera.position.x = cameraOriginalPosition.x + offsetX;
      camera.position.y = cameraOriginalPosition.y + offsetY;
      
      // Apply shake to DOM container for extra effect
      containerRef.current.style.transform = `translate(${offsetX * 10}px, ${offsetY * 10}px)`;
    }

    // Animation loop
    const animate = (time) => {
      const deltaTime = time - (requestRef.current || time);
      requestRef.current = time;
      
      // Update screen shake
      updateScreenShake(deltaTime);
      
      // Update particles
      updateParticles();
      
      renderer.render(scene, camera);
      requestAnimationFrame(animate);
    };
    requestAnimationFrame(animate);

    // Create blocks
    function setupBlocks() {
      for (let y = 0; y < GRID_HEIGHT; y++) {
        for (let x = 0; x < GRID_WIDTH; x++) {
          // Avoid creating initial matches
          let colorOptions = [...BLOCK_COLORS];
          
          // Check horizontal match
          if (x >= 2) {
            const color1 = gridRef.current[y][x-1]?.userData?.color;
            const color2 = gridRef.current[y][x-2]?.userData?.color;
            if (color1 && color2 && color1 === color2) {
              colorOptions = colorOptions.filter(c => c !== color1);
            }
          }
          
          // Check vertical match
          if (y >= 2) {
            const color1 = gridRef.current[y-1][x]?.userData?.color;
            const color2 = gridRef.current[y-2][x]?.userData?.color;
            if (color1 && color2 && color1 === color2) {
              colorOptions = colorOptions.filter(c => c !== color1);
            }
          }
          
          // Make sure we have at least one color option
          if (colorOptions.length === 0) {
            colorOptions = [...BLOCK_COLORS];
          }
          
          // Pick a random color from remaining options
          const colorIndex = Math.floor(Math.random() * colorOptions.length);
          const color = colorOptions[colorIndex];
          
          // Decide if block is special (has star)
          const isSpecial = Math.random() < 0.1;
          
          createBlock(x, y, color, isSpecial);
        }
      }
    }

    // Create a single block
    function createBlock(x, y, color, isSpecial = false) {
      // Create block
      const blockGeometry = new THREE.BoxGeometry(
        BLOCK_SIZE * 0.9, 
        BLOCK_SIZE * 0.9, 
        BLOCK_SIZE * 0.9
      );
      
      const blockMaterial = new THREE.MeshPhongMaterial({ 
        color: color,
        shininess: 70,
        specular: 0x444444
      });
      
      const block = new THREE.Mesh(blockGeometry, blockMaterial);
      
      // Position the block
      const xPos = (x - GRID_WIDTH/2 + 0.5) * (BLOCK_SIZE + BLOCK_SPACING);
      const yPos = (y - GRID_HEIGHT/2 + 0.5) * (BLOCK_SIZE + BLOCK_SPACING);
      block.position.set(xPos, yPos, 0);
      
      // Add edges
      const edges = new THREE.LineSegments(
        new THREE.EdgesGeometry(blockGeometry),
        new THREE.LineBasicMaterial({ color: 0xffffff })
      );
      block.add(edges);
      
      // Add special block indicator (star)
      if (isSpecial) {
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
      }
      
      // Set user data
      block.userData = {
        isBlock: true,
        gridPosition: { x, y },
        color: color,
        isSpecial: isSpecial
      };
      
      // Add to scene and grid reference
      scene.add(block);
      gridRef.current[y][x] = block;
      
      return block;
    }

    // Create explosive particle effect
    function createExplosion(position, color, count = 40) {
      // Start screen shake based on number of particles (more violent for special blocks)
      startScreenShake(count > 40 ? 0.3 : 0.15, 400);
      
      // Create bright flash
      const flashGeometry = new THREE.CircleGeometry(2, 32);
      const flashMaterial = new THREE.MeshBasicMaterial({
        color: 0xffffff,
        transparent: true,
        opacity: 0.8
      });
      const flash = new THREE.Mesh(flashGeometry, flashMaterial);
      flash.position.copy(position);
      flash.position.z = 0.2;
      scene.add(flash);
      
      // Fade out flash
      const flashDuration = 200;
      const flashStartTime = Date.now();
      
      function updateFlash() {
        const elapsed = Date.now() - flashStartTime;
        if (elapsed < flashDuration) {
          const progress = elapsed / flashDuration;
          flash.material.opacity = 0.8 * (1 - progress);
          flash.scale.set(1 + progress * 0.5, 1 + progress * 0.5, 1);
          requestAnimationFrame(updateFlash);
        } else {
          scene.remove(flash);
          flash.material.dispose();
          flash.geometry.dispose();
        }
      }
      
      updateFlash();
      
      // Create particles
      const particles = [];
      
      for (let i = 0; i < count; i++) {
        const size = Math.random() * 0.25 + 0.05;
        
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
        
        // Create glowing particle material
        const material = new THREE.MeshPhongMaterial({
          color: color,
          emissive: color,
          emissiveIntensity: 0.5,
          transparent: true,
          opacity: 1
        });
        
        const particle = new THREE.Mesh(geometry, material);
        particle.position.copy(position);
        
        // Random velocity with more vertical explosion
        const speed = Math.random() * 0.2 + 0.05;
        const angle = Math.random() * Math.PI * 2;
        const height = Math.random() * 0.2 + 0.1;
        
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
          decay: Math.random() * 0.03 + 0.01
        };
        
        scene.add(particle);
        particles.push(particle);
      }
      
      particlesRef.current = [...particlesRef.current, ...particles];
    }
    
    // Update particles with more dynamic behavior
    function updateParticles() {
      const deadParticles = [];
      
      particlesRef.current.forEach((particle, index) => {
        if (!particle || !particle.userData) return;
        
        // Update position
        particle.position.x += particle.userData.velocity.x;
        particle.position.y += particle.userData.velocity.y;
        particle.position.z += particle.userData.velocity.z;
        
        // Apply gravity
        particle.userData.velocity.z += particle.userData.gravity;
        
        // Add spin for more dynamic movement
        particle.rotation.x += particle.userData.spin.x;
        particle.rotation.y += particle.userData.spin.y;
        particle.rotation.z += particle.userData.spin.z;
        
        // Reduce life
        particle.userData.life -= particle.userData.decay;
        
        // Update opacity and scale
        particle.material.opacity = particle.userData.life;
        const scale = Math.max(0.1, particle.userData.life);
        particle.scale.set(scale, scale, scale);
        
        // Add color shifts for fire effect
        if (particle.userData.life < 0.5) {
          // Shift color toward red/orange for "burning out" effect
          const color = particle.material.color;
          color.r = Math.min(1, color.r + 0.01);
          color.g = Math.max(0, color.g - 0.01);
          color.b = Math.max(0, color.b - 0.01);
        }
        
        // Check if particle is dead
        if (particle.userData.life <= 0) {
          deadParticles.push(index);
          scene.remove(particle);
          
          // Dispose of geometry and material
          if (particle.geometry) particle.geometry.dispose();
          if (particle.material) particle.material.dispose();
        }
      });
      
      // Remove dead particles
      for (let i = deadParticles.length - 1; i >= 0; i--) {
        particlesRef.current.splice(deadParticles[i], 1);
      }
    }

    // Handle block selection
    function handleBlockClick(block) {
      if (lockInteractionRef.current) return;
      
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
        
        const xDiff = Math.abs(pos1.x - pos2.x);
        const yDiff = Math.abs(pos1.y - pos2.y);
        
        const isAdjacent = (xDiff === 1 && yDiff === 0) || (xDiff === 0 && yDiff === 1);
        
        if (isAdjacent) {
          // Swap blocks
          const blockToSwap = selectedBlockRef.current;
          unhighlightBlock(selectedBlockRef.current);
          selectedBlockRef.current = null;
          
          // Lock interactions during swap
          lockInteractionRef.current = true;
          
          swapBlocks(blockToSwap, block);
        } else {
          // Select new block instead
          unhighlightBlock(selectedBlockRef.current);
          selectedBlockRef.current = block;
          highlightBlock(block);
        }
      }
    }

    // Highlight selected block
    function highlightBlock(block) {
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
      glow.userData = { isGlow: true };
      block.add(glow);
    }

    // Unhighlight block
    function unhighlightBlock(block) {
      if (!block) return;
      
      block.scale.set(1, 1, 1);
      
      // Remove glow effect
      block.children.forEach(child => {
        if (child.userData && child.userData.isGlow) {
          block.remove(child);
          if (child.geometry) child.geometry.dispose();
          if (child.material) child.material.dispose();
        }
      });
    }

    // Swap blocks
    function swapBlocks(block1, block2) {
      // Get positions
      const pos1 = {...block1.userData.gridPosition};
      const pos2 = {...block2.userData.gridPosition};
      
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
      
      const duration = 15; // animation frames
      let frame = 0;
      
      function animateSwap() {
        if (frame <= duration) {
          const t = frame / duration;
          const smoothT = t * (2 - t); // easing function
          
          block1.position.lerpVectors(startPos1, endPos1, smoothT);
          block2.position.lerpVectors(startPos2, endPos2, smoothT);
          
          frame++;
          requestAnimationFrame(animateSwap);
        } else {
          // Check for matches after swap is complete
          const matchFound = checkForMatches();
          if (matchFound) {
            onScoreUpdate(10);
            // Don't unlock - will be unlocked after cascades complete
          } else {
            // If no match, swap back
            swapBlocksBack(block1, block2);
          }
        }
      }
      
      animateSwap();
    }
    
    // Swap blocks back if no match
    function swapBlocksBack(block1, block2) {
      // Get positions
      const pos1 = {...block1.userData.gridPosition};
      const pos2 = {...block2.userData.gridPosition};
      
      // Update grid reference
      gridRef.current[pos1.y][pos1.x] = block2;
      gridRef.current[pos2.y][pos2.x] = block1;
      
      // Update block userData
      block1.userData.gridPosition = {...pos2};
      block2.userData.gridPosition = {...pos1};
      
      // Animate the swap back
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
      
      const duration = 10; // animation frames
      let frame = 0;
      
      function animateSwapBack() {
        if (frame <= duration) {
          const t = frame / duration;
          const smoothT = t * (2 - t); // easing function
          
          block1.position.lerpVectors(startPos1, endPos1, smoothT);
          block2.position.lerpVectors(startPos2, endPos2, smoothT);
          
          frame++;
          requestAnimationFrame(animateSwapBack);
        } else {
          // Unlock interactions after swap back is complete
          lockInteractionRef.current = false;
        }
      }
      
      animateSwapBack();
    }

    // Check for matching blocks
    function checkForMatches() {
      let foundMatch = false;
      const matchedBlocks = new Set();
      
      // Check horizontal matches
      for (let y = 0; y < GRID_HEIGHT; y++) {
        for (let x = 0; x < GRID_WIDTH - 2; x++) {
          const block1 = gridRef.current[y][x];
          const block2 = gridRef.current[y][x+1];
          const block3 = gridRef.current[y][x+2];
          
          if (block1 && block2 && block3 && 
              block1.userData.color === block2.userData.color &&
              block2.userData.color === block3.userData.color) {
            
            // Match found!
            foundMatch = true;
            matchedBlocks.add(block1);
            matchedBlocks.add(block2);
            matchedBlocks.add(block3);
          }
        }
      }
      
      // Check vertical matches
      for (let x = 0; x < GRID_WIDTH; x++) {
        for (let y = 0; y < GRID_HEIGHT - 2; y++) {
          const block1 = gridRef.current[y][x];
          const block2 = gridRef.current[y+1][x];
          const block3 = gridRef.current[y+2][x];
          
          if (block1 && block2 && block3 && 
              block1.userData.color === block2.userData.color &&
              block2.userData.color === block3.userData.color) {
            
            // Match found!
            foundMatch = true;
            matchedBlocks.add(block1);
            matchedBlocks.add(block2);
            matchedBlocks.add(block3);
          }
        }
      }
      
      if (matchedBlocks.size > 0) {
        // Count special blocks for more intense effects
        let specialCount = 0;
        matchedBlocks.forEach(block => {
          if (block.userData.isSpecial) specialCount++;
        });
        
        // Calculate center position for the main explosion
        let centerX = 0, centerY = 0;
        matchedBlocks.forEach(block => {
          centerX += block.position.x;
          centerY += block.position.y;
        });
        centerX /= matchedBlocks.size;
        centerY /= matchedBlocks.size;
        
        // Create big explosion at the center
        createExplosion(
          new THREE.Vector3(centerX, centerY, 0), 
          0xffffff, // White center explosion
          60 + specialCount * 20 // More particles for special blocks
        );
        
        // Create smaller explosions at each block
        matchedBlocks.forEach(block => {
          // Slight delay for cascading effect
          setTimeout(() => {
            // Create explosion effect
            createExplosion(
              block.position.clone(), 
              block.userData.color,
              block.userData.isSpecial ? 30 : 20
            );
            
            // Award bonus points for special blocks
            if (block.userData.isSpecial) {
              onScoreUpdate(20); // Bonus points
              
              // Extra screen shake for special blocks
              startScreenShake(0.25, 300);
            }
            
            // Schedule removal
            setTimeout(() => {
              removeBlock(block);
            }, 100);
          }, Math.random() * 150); // Staggered explosions
        });
        
        // Fill empty spaces after a delay
        setTimeout(() => {
          fillEmptySpaces();
        }, 500);
      }
      
      return foundMatch;
    }

    // Remove a block with explosive effect
    function removeBlock(block) {
      if (!block) return;
      
      const { x, y } = block.userData.gridPosition;
      gridRef.current[y][x] = null;
      
      // Animate removal with explosion
      let scale = 1;
      let rotationSpeed = Math.random() * 0.2 + 0.1;
      
      function animateRemoval() {
        if (scale > 0.1) {
          scale -= 0.1;
          block.scale.set(scale, scale, scale);
          
          // Add rotation for more dynamic effect
          block.rotation.x += rotationSpeed;
          block.rotation.y += rotationSpeed;
          block.rotation.z += rotationSpeed;
          
          requestAnimationFrame(animateRemoval);
        } else {
          scene.remove(block);
          if (block.geometry) block.geometry.dispose();
          if (block.material) block.material.dispose();
        }
      }
      
      animateRemoval();
    }

    // Fill empty spaces
    function fillEmptySpaces() {
      // Apply gravity - move blocks down to fill empty spaces
      for (let x = 0; x < GRID_WIDTH; x++) {
        for (let y = 0; y < GRID_HEIGHT - 1; y++) {
          if (gridRef.current[y][x] === null) {
            // Look for blocks above to fall down
            for (let above = y + 1; above < GRID_HEIGHT; above++) {
              if (gridRef.current[above][x] !== null) {
                const block = gridRef.current[above][x];
                
                // Update grid reference
                gridRef.current[y][x] = block;
                gridRef.current[above][x] = null;
                
                // Update block data
                block.userData.gridPosition.y = y;
                
                // Animate falling with bounce effect
                const startPos = block.position.clone();
                const endPos = new THREE.Vector3(
                  (x - GRID_WIDTH/2 + 0.5) * (BLOCK_SIZE + BLOCK_SPACING),
                  (y - GRID_HEIGHT/2 + 0.5) * (BLOCK_SIZE + BLOCK_SPACING),
                  0
                );
                
                const duration = 25;
                let frame = 0;
                
                function animateFall() {
                  if (frame <= duration) {
                    const t = frame / duration;
                    
                    // Bounce effect
                    let smoothT;
                    if (t < 0.8) {
                      smoothT = t * 1.25; // Accelerate down
                    } else {
                      // Bounce at the end
                      const bounceT = (t - 0.8) * 5; // Scale to 0-1 range
                      const bounceFactor = Math.sin(bounceT * Math.PI) * 0.1;
                      smoothT = 0.8 + (t - 0.8) * 1.25 - bounceFactor;
                    }
                    
                    block.position.lerpVectors(startPos, endPos, smoothT);
                    
                    frame++;
                    requestAnimationFrame(animateFall);
                  }
                }
                
                animateFall();
                break;
              }
            }
          }
        }
      }
      
      // Create new blocks for empty spaces at the top
      for (let x = 0; x < GRID_WIDTH; x++) {
        for (let y = 0; y < GRID_HEIGHT; y++) {
          if (gridRef.current[y][x] === null) {
            const colorIndex = Math.floor(Math.random() * BLOCK_COLORS.length);
            const color = BLOCK_COLORS[colorIndex];
            const isSpecial = Math.random() < 0.1;
            
            // Create new block above the grid
            const block = createBlock(x, y, color, isSpecial);
            
            // Position above the grid
            const startY = ((GRID_HEIGHT + 3) - GRID_HEIGHT/2 + 0.5) * (BLOCK_SIZE + BLOCK_SPACING);
            block.position.y = startY;
            
            // Animate falling with bounce effect
            const startPos = block.position.clone();
            const endPos = new THREE.Vector3(
              (x - GRID_WIDTH/2 + 0.5) * (BLOCK_SIZE + BLOCK_SPACING),
              (y - GRID_HEIGHT/2 + 0.5) * (BLOCK_SIZE + BLOCK_SPACING),
              0
            );
            
            const duration = 30;
            let frame = 0;
            
            function animateFall() {
              if (frame <= duration) {
                const t = frame / duration;
                
                // Bounce effect
                let smoothT;
                if (t < 0.8) {
                  smoothT = t * 1.25; // Accelerate down
                } else {
                  // Bounce at the end
                  const bounceT = (t - 0.8) * 5; // Scale to 0-1 range
                  const bounceFactor = Math.sin(bounceT * Math.PI) * 0.2;
                  smoothT = 0.8 + (t - 0.8) * 1.25 - bounceFactor;
                }
                
                block.position.lerpVectors(startPos, endPos, smoothT);
                
                frame++;
                requestAnimationFrame(animateFall);
              }
            }
            
            animateFall();
          }
        }
      }
      
      // Check for new matches after filling
      setTimeout(() => {
        const newMatches = checkForMatches();
        if (newMatches) {
          onScoreUpdate(5); // Small bonus for cascade matches
        } else {
          // Unlock interactions if no more matches
          lockInteractionRef.current = false;
        }
      }, 800);
    }

    // Cleanup
    return () => {
      console.log("GameBoard unmounting");
      renderer.domElement.removeEventListener('click', handleClick);
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(requestRef.current);
      
      // Cleanup all THREE.js objects to prevent memory leaks
      scene.traverse((object) => {
        if (object.geometry) object.geometry.dispose();
        if (object.material) {
          if (Array.isArray(object.material)) {
            object.material.forEach(material => material.dispose());
          } else {
            object.material.dispose();
          }
        }
      });
      
      // Clear container
      if (containerRef.current) {
        while (containerRef.current.firstChild) {
          containerRef.current.removeChild(containerRef.current.firstChild);
        }
      }
    };
  }, [onScoreUpdate]);

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
    />
  );
};

export default GameBoard;