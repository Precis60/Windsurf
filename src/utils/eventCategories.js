export const eventCategories = {
  'Personal Calendar': { color: '#F8C8DC', textColor: '#22314a' },       // pastel pink
  'Business Calendar': { color: '#CDEAC0', textColor: '#22314a' },        // pastel green
  'Kids Sports & Events': { color: '#FDE2A7', textColor: '#22314a' },     // pastel yellow
  'Personal Sports & Events': { color: '#FFCFD2', textColor: '#22314a' }, // soft blush
  'Centre Com Computers': { color: '#D7C0FD', textColor: '#22314a' },     // pastel purple
  'Commerical': { color: '#C7D2FE', textColor: '#22314a' },               // periwinkle
  'Daniel Allison': { color: '#BDE0FE', textColor: '#22314a' },           // baby blue
  'Jaki Lew': { color: '#CAF0F8', textColor: '#22314a' },                 // light aqua
  'Krongold Family': { color: '#B8E0D2', textColor: '#22314a' },          // mint teal
  'Krongold Group': { color: '#FFE5B4', textColor: '#22314a' },           // peach
  'Office & Administration': { color: '#E3F2C1', textColor: '#22314a' },  // pale lime
  'Peter & Alla Lew': { color: '#F9E2AF', textColor: '#22314a' },         // butter
  'Remote Programming': { color: '#E4C1F9', textColor: '#22314a' },       // lilac
  'Residential': { color: '#F1F0FF', textColor: '#22314a' },              // near-white lavender
  'Rosie Lew': { color: '#FFD6E0', textColor: '#22314a' },                // rose
  'Stevie Lew': { color: '#FFEDC2', textColor: '#22314a' },               // light apricot
  'Supply & Demand': { color: '#D0F4DE', textColor: '#22314a' },          // seafoam
  'Training & Research': { color: '#C9E4DE', textColor: '#22314a' },      // sage
  'Travel Time': { color: '#EAD7BB', textColor: '#22314a' },              // sand
  'Website & Marketing': { color: '#E0E0E0', textColor: '#22314a' },      // light grey
  'Precision Home Education': { color: '#CFE1F2', textColor: '#22314a' }  // soft sky
};

export const getCategoryStyle = (category) => {
  return eventCategories[category] || { color: '#E0E0E0', textColor: '#000' };
};
