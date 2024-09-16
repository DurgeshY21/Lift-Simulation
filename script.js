document.addEventListener('DOMContentLoaded', () => {
  const numberOfFloors = parseInt(localStorage.getItem('floors'), 10);
  const numberOfLifts = parseInt(localStorage.getItem('lifts'), 10);

  const state = {
    floors: Array.from({ length: numberOfFloors }, (_, i) => ({ id: i })),
    lifts: Array.from({ length: numberOfLifts }, (_, i) => ({
      id: i,
      currentFloor: 0, // All lifts start at the 0th floor
      moving: false,
      doorsOpen: false
    })),
    requests: []
  };

  const building = document.getElementById('building');
  
  const floorHeight = 100; // Example height per floor in pixels. Adjust as needed.
  const liftWidth = 50; // Width of each lift
const liftGap = 70; // Gap between lifts
const totalLiftsWidth = (numberOfLifts * liftWidth) + ((numberOfLifts - 1) * liftGap); // Total width occupied by lifts

// Adjust the floor width dynamically based on the number of lifts
const floorWidth = totalLiftsWidth + 200; // Add extra space (e.g., 40px) for better appearance


const initializeSimulation = () => {
  building.innerHTML = ''; // Clear previous contents

  // Set the total height and width of the building
  building.style.height = `${numberOfFloors * floorHeight}px`;
  building.style.width = `${floorWidth}px`;
  building.style.position = 'relative'; // Ensure the building is positioned relative

  // Create floor elements
  state.floors.forEach(floor => {
    const floorDiv = document.createElement('div');
    floorDiv.className = 'floor';
    floorDiv.id = `floor-${floor.id}`;
    floorDiv.style.height = `${floorHeight}px`; // Set floor height dynamically
    floorDiv.style.width = `${floorWidth}px`; // Set floor width dynamically
    floorDiv.innerHTML = `<span>Floor ${floor.id}</span>`;

      const buttonContainer = document.createElement('div');
    buttonContainer.className = 'button-container'

    // Create buttons dynamically based on floor position
    if (floor.id > 0) {
      const downButton = document.createElement('button');
      downButton.textContent = 'Down';
      downButton.onclick = () => requestLift(floor.id, 'down');
      buttonContainer.appendChild(downButton);
    }
    if (floor.id < state.floors.length - 1) {
      const upButton = document.createElement('button');
      upButton.textContent = 'Up';
      upButton.onclick = () => requestLift(floor.id, 'up');
      buttonContainer.appendChild(upButton);
    }

    // Append the button container to the floor div
    floorDiv.appendChild(buttonContainer);
    building.appendChild(floorDiv);
  });

  // Create lift elements
  state.lifts.forEach((lift, index) => {
    const liftDiv = document.createElement('div');
    liftDiv.className = `lift`;
    liftDiv.id = `lift-${lift.id}`;
    liftDiv.style.position = 'absolute'; // Absolute positioning within the building
    liftDiv.style.width = `${liftWidth}px`; // Set lift width
    liftDiv.style.height = `${floorHeight}px`; // Set lift height equal to floor height
    liftDiv.style.bottom = `${lift.currentFloor * floorHeight}px`; // Position lift on the 0th floor initially

    // Set horizontal position for each lift with a gap
    liftDiv.style.left = `${index * (liftWidth + liftGap)}px`; // Space lifts with gap

    const doors = document.createElement('div');
    doors.className = 'doors';
    doors.innerHTML = `
      <div class="door door-left"></div>
      <div class="door door-right"></div>
    `;
    liftDiv.appendChild(doors);
    building.appendChild(liftDiv);
  });
};


  const requestLift = (floorId, direction) => {
    // Add request to the list
    state.requests.push({ floorId, direction });
    console.log(`Request received for floor ${floorId} to go ${direction}`);

    // Process the request
    processRequests();
  };

  const processRequests = () => {
    if (state.requests.length === 0) return;

    // Process the first request in the queue
    const request = state.requests.shift();

    // Find the closest available lift to the requested floor
    let closestLift = null;
    let shortestDistance = Infinity;

    state.lifts.forEach(lift => {
      if (!lift.moving) {
        const distance = Math.abs(lift.currentFloor - request.floorId);
        if (distance < shortestDistance) {
          closestLift = lift;
          shortestDistance = distance;
        }
      }
    });

    if (closestLift) {
      // Move the closest lift to the requested floor
      moveLift(closestLift, request.floorId);
    }
  };

  const moveLift = (lift, targetFloor) => {
    if (lift.moving) return;

    if (lift.currentFloor === targetFloor) {
      console.log(`Lift ${lift.id} is already at floor ${targetFloor}`);
      openLiftDoors(lift);
      return; // If lift is already at the target floor, do nothing more
    }

    lift.moving = true;
    const liftElement = document.getElementById(`lift-${lift.id}`);
    liftElement.classList.add('moving');

    const currentFloor = lift.currentFloor;
    const distance = Math.abs(targetFloor - currentFloor);
    const moveDuration = distance * 2000; // Adjust based on speed of lift movement

    // Simulate lift movement
    liftElement.style.transition = `bottom ${moveDuration}ms linear`;
    liftElement.style.bottom = `${targetFloor * floorHeight}px`;

    // Update lift state after movement
    setTimeout(() => {
      lift.currentFloor = targetFloor;
      lift.moving = false;
      liftElement.classList.remove('moving');

      // Simulate door opening after reaching the floor
      openLiftDoors(lift);

      // Continue processing any remaining requests
      processRequests();
    }, moveDuration);
  };

  const openLiftDoors = (lift) => {
    lift.doorsOpen = true;
    const liftElement = document.getElementById(`lift-${lift.id}`);
    liftElement.classList.add('doors-open');
    console.log(`Lift ${lift.id} doors opening at floor ${lift.currentFloor}`);

    // Simulate doors closing after a delay
    setTimeout(() => {
      lift.doorsOpen = false;
      liftElement.classList.remove('doors-open');
      console.log(`Lift ${lift.id} doors closing`);
    }, 3000); // Doors stay open for 3 seconds
  };

  // Initialize the simulation
  initializeSimulation();

  // Expose the requestLift function globally
  window.requestLift = requestLift;
});
