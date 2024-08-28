document.addEventListener('DOMContentLoaded', () => {
  // Get number of floors and lifts from localStorage
  const numberOfFloors = parseInt(localStorage.getItem('floors'), 10);
  const numberOfLifts = parseInt(localStorage.getItem('lifts'), 10);

  const state = {
    floors: Array.from({ length: numberOfFloors }, (_, i) => ({ id: i })),
    lifts: Array.from({ length: numberOfLifts }, (_, i) => ({
      id: i,
      currentFloor: 0,
      moving: false,
      doorsOpen: false
    })),
    requests: []
  };

  const initializeSimulation = () => {
    const building = document.getElementById('building');
    building.innerHTML = ''; // Clear previous contents

    // Create floor elements
    state.floors.forEach(floor => {
      const floorDiv = document.createElement('div');
      floorDiv.className = 'floor';
      floorDiv.id = `floor-${floor.id}`;

      if (floor.id === 0) {
        floorDiv.innerHTML = `
          <span>Floor ${floor.id}</span>
          <button onclick="requestLift(${floor.id}, 'up')">Up</button>
        `;
      } else if (floor.id === state.floors.length - 1) {
        floorDiv.innerHTML = `
          <span>Floor ${floor.id}</span>
          <button onclick="requestLift(${floor.id}, 'down')">Down</button>
        `;
      } else {
        floorDiv.innerHTML = `
          <span>Floor ${floor.id}</span>
          <button onclick="requestLift(${floor.id}, 'up')">Up</button>
          <button onclick="requestLift(${floor.id}, 'down')">Down</button>
        `;
      }

      building.appendChild(floorDiv);
    });

    // Create lift elements
    state.lifts.forEach(lift => {
      const liftDiv = document.createElement('div');
      liftDiv.className = `lift ${lift.moving ? 'moving' : ''} ${lift.doorsOpen ? 'doors-open' : ''}`;
      liftDiv.id = `lift-${lift.id}`;
      liftDiv.style.bottom = `${lift.currentFloor * 70}px`;

      const doorLeft = document.createElement('div');
      doorLeft.className = 'door door-left';
      
      const doorRight = document.createElement('div');
      doorRight.className = 'door door-right';
      
      const doors = document.createElement('div');
      doors.className = 'doors';
      doors.appendChild(doorLeft);
      doors.appendChild(doorRight);

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

    state.requests.forEach(request => {
      // Find the lift closest to the requested floor
      let closestLift = state.lifts[0];
      let shortestDistance = Math.abs(closestLift.currentFloor - request.floorId);

      state.lifts.forEach(lift => {
        const distance = Math.abs(lift.currentFloor - request.floorId);
        if (distance < shortestDistance) {
          closestLift = lift;
          shortestDistance = distance;
        }
      });

      // Move the closest lift to the requested floor
      moveLift(closestLift, request.floorId);
    });

    // Clear the request list
    state.requests = [];
  };

  const moveLift = (lift, targetFloor) => {
    if (lift.moving) return;

    lift.moving = true;
    document.getElementById(`lift-${lift.id}`).classList.add('moving');

    const currentFloor = lift.currentFloor;
    const distance = Math.abs(targetFloor - currentFloor);
    const moveDuration = distance * 2000; // Adjust based on speed of lift movement

    // Simulate lift movement
    const liftElement = document.getElementById(`lift-${lift.id}`);
    liftElement.style.transition = `bottom ${moveDuration}ms linear`;
    liftElement.style.bottom = `${targetFloor * 70}px`;

    // Update lift state after movement
    setTimeout(() => {
      lift.currentFloor = targetFloor;
      lift.moving = false;
      liftElement.classList.remove('moving');
    }, moveDuration); // Match the transition duration
  };

  // Initialize the simulation
  initializeSimulation();

  // Expose the requestLift function globally
  window.requestLift = requestLift;
});
