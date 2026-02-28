# Lost and Found Project
## Running the Application

### Install Supabase Dependencies
- In the Lost-and-Found-App directory type in the terminal: npm install @supabase/supabase-js . This should install a folder called node_modules which includes all dependencies for the project.

### Run the Application
- In the same directory type: npm run dev into the terminal; this should show the local host link for the app.


## UI Test Mode (Item Card Preview)
- To preview the reusable `ItemCard` component: Create or edit a `.env` file in the project root. Add: ```VITE_UI_TEST=true```. Restart the app (`npm run dev`). Set `VITE_UI_TEST=false` (or remove it) to load the default Vite app.
