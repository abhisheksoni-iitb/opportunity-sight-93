-- Create location/market opportunity recommendations table
CREATE TABLE public.location_recommendations (
  rec_id integer PRIMARY KEY,
  location text NOT NULL,
  trending_categories text NOT NULL,
  top_brands text NOT NULL,
  avg_monthly_demand integer NOT NULL,
  peak_season text NOT NULL,
  competition_level text NOT NULL,
  suggested_skus text NOT NULL,
  why_trending text NOT NULL,
  last_updated date NOT NULL,
  created_at timestamp with time zone DEFAULT now()
);

-- Create user/opportunity recommendations table
CREATE TABLE public.user_recommendations (
  rec_id integer PRIMARY KEY,
  user_id integer NOT NULL,
  recommended_category text NOT NULL,
  specific_sku text NOT NULL,
  fit_score integer NOT NULL,
  projected_monthly_demand integer NOT NULL,
  top_competing_brands text NOT NULL,
  expected_roi_pct integer NOT NULL,
  why_fit text NOT NULL,
  action_priority text NOT NULL,
  confidence integer NOT NULL,
  required_certifications text NOT NULL,
  last_recommended date NOT NULL,
  created_at timestamp with time zone DEFAULT now()
);

-- Enable RLS on both tables
ALTER TABLE public.location_recommendations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_recommendations ENABLE ROW LEVEL SECURITY;

-- Create policies for public read access
CREATE POLICY "Location recommendations are publicly readable"
ON public.location_recommendations FOR SELECT
USING (true);

CREATE POLICY "User recommendations are publicly readable" 
ON public.user_recommendations FOR SELECT
USING (true);

-- Insert location recommendations data
INSERT INTO public.location_recommendations (rec_id, location, trending_categories, top_brands, avg_monthly_demand, peak_season, competition_level, suggested_skus, why_trending, last_updated) VALUES
(2001, 'Austin, TX', 'Functional Beverages, Energy Drinks', 'Red Bull, Monster, Vita Coco', 92000, 'Summer', 'Medium', 'Coconut Water, Zero-Sugar Energy Drink', 'Hot tech city, fitness-focused, young demography drives demand for health+energy drinks.', '2025-08-25'),
(2002, 'Newark, NJ', 'Classic Sodas, Lemon-Lime Soda', 'Coca-Cola, Pepsi, Sprite', 104000, 'All Year', 'High', 'Original Taste Soda, Lemon-Lime Soda', 'North East corridor, strong urban consumption, family-oriented', '2025-08-26'),
(2003, 'Orlando, FL', 'Baked Snacks, Plant-Based Chips', 'Lays, Doritos, Impossible', 57000, 'Winter', 'Low', 'Plant-Based Nachos, Sweet Potato Chips', 'Tourist destination, wellness-conscious trends, low direct competition for plant-based chips.', '2025-08-27'),
(2004, 'Seattle, WA', 'Cold Brew, RTD Coffee', 'Starbucks, La Colombe, Peet''s', 36400, 'Spring-Fall', 'Medium', 'RTD Coffee Can, Dairy-free Cold Brew', 'Innovative food/beverage culture, high adoption of premium coffee/beverages.', '2025-08-26'),
(2005, 'Minneapolis, MN', 'Infant Formula, Milk-Based Powders', 'Similac, Enfamil', 26000, 'All Year', 'Low', 'Milk-Based Powder With Iron', 'High birth rates, strong regional brands, demand for quality-conscious infant nutrition.', '2025-08-27'),
(2006, 'Las Vegas, NV', 'Savory Snacks, Party Beverages', 'Doritos, Budweiser, Modelo', 93000, 'Fall-Spring', 'Low', 'Nacho Cheese Tortilla Chips, Especial Lager', 'Hospitality hub, frequent events create steady snack/beverage consumption.', '2025-08-26'),
(2007, 'Phoenix, AZ', 'Zero-Sugar Soft Drinks, Light Beer', 'Pepsi, Michelob, Monster', 88000, 'Spring-Summer', 'Medium', 'Zero Ultra Energy Drink, Superior Light Beer', 'Rising health awareness, high demand for hydrating and low-calorie options.', '2025-08-26'),
(2008, 'Miami, FL', 'Wellness Juices, Strawberry Products', 'Suja, Driscoll''s, Bolthouse Farms', 64500, 'Winter', 'High', 'Driscoll''s Strawberries, Wellness Juices', 'Fitness, Latin influence, major hub for fresh fruit/wellness trends.', '2025-08-26'),
(2009, 'Denver, CO', 'Organic Lemonade, Craft Beer', 'Honest, Blue Moon, Cutwater', 57000, 'Summer', 'Medium', 'Organic Lemonade, RTD Cocktails', 'Active outdoor culture, high disposable income, local pride in innovative SKUs.', '2025-08-25'),
(2010, 'Louisville, KY', 'Classic Potato Chips, Cola Soda', 'Lays, Pepsi, Coca-Cola', 49500, 'All Year', 'Low', 'Classic Potato Chips, Cola Soda', 'Low competition in classic salty snacks, steady all-year demand for cola.', '2025-08-27');

-- Insert user recommendations data
INSERT INTO public.user_recommendations (rec_id, user_id, recommended_category, specific_sku, fit_score, projected_monthly_demand, top_competing_brands, expected_roi_pct, why_fit, action_priority, confidence, required_certifications, last_recommended) VALUES
(3001, 1, 'Functional Beverages', 'Coconut Water', 94, 4800, 'Vita Coco', 32, 'Large young/adult population, major local gyms, capacity matches demand.', 'High', 92, 'USDA Organic', '2025-08-26'),
(3002, 2, 'Plant-Based Snacks', 'Sweet Potato Chips', 89, 2100, 'Terra Chips', 28, 'Gluten-free certification and fryer capacity; fits emerging clean label snack niche.', 'Medium', 87, 'Gluten-Free', '2025-08-27'),
(3003, 3, 'RTD Cocktails', 'Canned Margaritas', 91, 3100, 'Cutwater', 34, 'Brewery lines idle 4 months/year; can repurpose for canned cocktails.', 'High', 90, 'State Alcohol Permit', '2025-08-27'),
(3004, 4, 'Infant Nutrition', 'Optigro Milk-Based Powder', 97, 1700, 'Similac', 36, 'Blender/spray dryer in use; North Central US shows highest brand growth.', 'Critical', 96, 'FDA Infant Formula', '2025-08-26'),
(3005, 5, 'Fresh Fruit Snacks', 'Dried Strawberries', 87, 2000, 'Stoneridge', 27, 'Dairy facility includes dehydration; Miami data shows strong Q1 demand.', 'Medium', 83, 'USDA Organic', '2025-08-25'),
(3006, 6, 'Soda', 'Zero Sugar Energy Drink', 93, 4100, 'Monster', 25, 'Excess bottling hourly rates; health trends in LA support quick adoption.', 'High', 91, 'FSSC 22000', '2025-08-27'),
(3007, 7, 'Classic Chips', 'Classic Potato Chips', 84, 1500, 'Lays', 22, 'Strong Texas brand appeal, under-served chip flavor profile.', 'Medium', 79, 'Gluten-Free', '2025-08-27'),
(3008, 8, 'Bulk Beer', 'Especial Pilsner-Style Lager', 95, 5700, 'Modelo', 41, 'Access to Midwest barley supply, regional events spike demand.', 'High', 89, 'Brewery Licensing', '2025-08-26'),
(3009, 9, 'Wellness Juices', 'Cold Pressed Green Juice', 90, 2500, 'Suja', 28, 'Miami/Florida market demand, idle pasteurizer line available for premium juice SKUs.', 'Critical', 88, 'USDA Organic', '2025-08-25'),
(3010, 10, 'Energy Drinks', 'Red Bull Energy Drink, 8.4 Fl Oz', 97, 8100, 'Red Bull', 37, 'Boston demand for single-serve; largest Red Bull opportunity in Northeast.', 'High', 94, 'Kosher', '2025-08-27');