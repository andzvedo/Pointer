document.addEventListener('DOMContentLoaded', () => {
  // Filter button functionality
  const filterButtons = document.querySelectorAll('.filter-btn');
  filterButtons.forEach(button => {
    button.addEventListener('click', () => {
      // Remove active class from all buttons in the same group
      const group = button.closest('.filter-group');
      group.querySelectorAll('.filter-btn').forEach(btn => btn.classList.remove('active'));
      // Add active class to clicked button
      button.classList.add('active');
      console.log(`Filter selected: ${button.textContent.trim()}`);
    });
  });

  // Initialize collapsible sections
  const collapseButtons = document.querySelectorAll('.collapse-btn');
  collapseButtons.forEach(button => {
    // Set initial state for all sections (expanded by default)
    const eventCard = button.closest('.event-card');
    const eventItems = eventCard.querySelector('.event-items');
    const icon = button.querySelector('.material-icons');
    
    // Add click event
    button.addEventListener('click', (e) => {
      e.preventDefault();
      
      if (eventItems.classList.contains('collapsed')) {
        // Expand
        eventItems.classList.remove('collapsed');
        eventItems.style.maxHeight = eventItems.scrollHeight + 'px';
        setTimeout(() => {
          eventItems.style.maxHeight = 'none';
        }, 200);
        icon.textContent = 'expand_less';
      } else {
        // Collapse
        eventItems.style.maxHeight = eventItems.scrollHeight + 'px';
        setTimeout(() => {
          eventItems.classList.add('collapsed');
          eventItems.style.maxHeight = '0';
        }, 10);
        icon.textContent = 'expand_more';
      }
    });
  });

  // Button interactions
  const buttons = document.querySelectorAll('.btn');
  buttons.forEach(button => {
    button.addEventListener('click', (e) => {
      const ripple = document.createElement('span');
      ripple.classList.add('ripple');
      button.appendChild(ripple);
      
      const rect = button.getBoundingClientRect();
      const size = Math.max(rect.width, rect.height);
      ripple.style.width = ripple.style.height = `${size}px`;
      
      const x = e.clientX - rect.left - size / 2;
      const y = e.clientY - rect.top - size / 2;
      ripple.style.left = `${x}px`;
      ripple.style.top = `${y}px`;
      
      setTimeout(() => {
        ripple.remove();
      }, 600);
      
      console.log(`Button clicked: ${e.currentTarget.textContent.trim()}`);
    });
  });

  // Add subtle hover effects for interactive elements
  const interactiveElements = document.querySelectorAll('.item-row, .filter-btn');
  interactiveElements.forEach(element => {
    element.addEventListener('mouseenter', () => {
      element.style.backgroundColor = 'rgba(0, 0, 0, 0.02)';
      element.style.transition = 'background-color 0.2s ease';
    });
    
    element.addEventListener('mouseleave', () => {
      element.style.backgroundColor = '';
    });
  });

  // Simulate data loading
  console.log('UI initialized from Figma AST data');
});
