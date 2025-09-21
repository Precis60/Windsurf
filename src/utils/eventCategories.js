export const eventCategories = {
  'Personal Calendar': { color: '#4285F4', textColor: '#fff' },
  'Business Calendar': { color: '#34A853', textColor: '#fff' },
  'Kids Sports & Events': { color: '#FBBC05', textColor: '#000' },
  'Personal Sports & Events': { color: '#EA4335', textColor: '#fff' },
  'Centre Com Computers': { color: '#9C27B0', textColor: '#fff' },
  'Commerical': { color: '#673AB7', textColor: '#fff' },
  'Daniel Allison': { color: '#3F51B5', textColor: '#fff' },
  'Jaki Lew': { color: '#2196F3', textColor: '#fff' },
  'Krongold Family': { color: '#03A9F4', textColor: '#fff' },
  'Krongold Group': { color: '#00BCD4', textColor: '#fff' },
  'Office & Administration': { color: '#009688', textColor: '#fff' },
  'Peter & Alla Lew': { color: '#4CAF50', textColor: '#fff' },
  'Remote Programming': { color: '#8BC34A', textColor: '#000' },
  'Residential': { color: '#CDDC39', textColor: '#000' },
  'Rosie Lew': { color: '#FFEB3B', textColor: '#000' },
  'Stevie Lew': { color: '#FFC107', textColor: '#000' },
  'Supply & Demand': { color: '#FF9800', textColor: '#000' },
  'Training & Research': { color: '#FF5722', textColor: '#fff' },
  'Travel Time': { color: '#795548', textColor: '#fff' },
  'Website & Marketing': { color: '#9E9E9E', textColor: '#fff' },
  'Precision Home Education': { color: '#607D8B', textColor: '#fff' }
};

export const getCategoryStyle = (category) => {
  return eventCategories[category] || { color: '#E0E0E0', textColor: '#000' };
};
