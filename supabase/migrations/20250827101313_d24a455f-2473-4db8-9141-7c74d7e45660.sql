-- Create user_data table for storing user profiles
CREATE TABLE public.user_data (
  user_id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  company_name TEXT,
  location JSONB DEFAULT '{}',
  certifications TEXT[] DEFAULT '{}',
  current_products TEXT[] DEFAULT '{}',
  processes TEXT[] DEFAULT '{}',
  capacity TEXT,
  interests TEXT[] DEFAULT '{}',
  last_active TIMESTAMP WITH TIME ZONE DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create supplier_trends table for market trend data
CREATE TABLE public.supplier_trends (
  trend_id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  product_category TEXT NOT NULL,
  geography JSONB DEFAULT '{}',
  demand_score INTEGER CHECK (demand_score >= 0 AND demand_score <= 100),
  market_size NUMERIC,
  avg_price NUMERIC,
  required_setup TEXT[] DEFAULT '{}',
  trending_brands TEXT[] DEFAULT '{}',
  supplier_density INTEGER,
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create recommendations table for storing generated recommendations
CREATE TABLE public.recommendations (
  rec_id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  trend_id UUID REFERENCES public.supplier_trends(trend_id),
  fit_score INTEGER CHECK (fit_score >= 0 AND fit_score <= 100),
  reasoning TEXT,
  setup_requirements JSONB DEFAULT '{}',
  date_recommended TIMESTAMP WITH TIME ZONE DEFAULT now(),
  engagement_action TEXT,
  outcome TEXT,
  context JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.user_data ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.supplier_trends ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.recommendations ENABLE ROW LEVEL SECURITY;

-- Create policies for public access (since no auth is implemented yet)
CREATE POLICY "User data is publicly readable" 
ON public.user_data 
FOR SELECT 
USING (true);

CREATE POLICY "User data is publicly insertable" 
ON public.user_data 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "User data is publicly updatable" 
ON public.user_data 
FOR UPDATE 
USING (true);

CREATE POLICY "Supplier trends are publicly readable" 
ON public.supplier_trends 
FOR SELECT 
USING (true);

CREATE POLICY "Supplier trends are publicly insertable" 
ON public.supplier_trends 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Recommendations are publicly readable" 
ON public.recommendations 
FOR SELECT 
USING (true);

CREATE POLICY "Recommendations are publicly insertable" 
ON public.recommendations 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Recommendations are publicly updatable" 
ON public.recommendations 
FOR UPDATE 
USING (true);

-- Create updated_at trigger for supplier_trends
CREATE TRIGGER update_supplier_trends_updated_at
BEFORE UPDATE ON public.supplier_trends
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Insert seed data for demonstration
INSERT INTO public.user_data (user_id, company_name, location, certifications, current_products, processes, capacity, interests) VALUES
('11111111-1111-1111-1111-111111111111', 'Mumbai Food Co', '{"city": "Mumbai", "state": "Maharashtra", "country": "India", "region": "Western India"}', '{"ISO 9001", "FSSAI", "Organic Certification"}', '{"Spices", "Snacks", "Beverages"}', '{"Food Processing", "Packaging", "Quality Control"}', 'Medium (100-500 units/day)', '{"Organic Foods", "Export Markets", "Health Foods"}'),
('22222222-2222-2222-2222-222222222222', 'Bengaluru Tech Products', '{"city": "Bengaluru", "state": "Karnataka", "country": "India", "region": "Southern India"}', '{"ISO 14001", "CE Marking"}', '{"Electronics", "Components"}', '{"PCB Assembly", "Testing", "Design"}', 'Small (10-100 units/day)', '{"IoT Devices", "Smart Home", "Automotive"}'),
('33333333-3333-3333-3333-333333333333', 'Delhi Textiles Ltd', '{"city": "Delhi", "state": "Delhi", "country": "India", "region": "Northern India"}', '{"GOTS", "OEKO-TEX"}', '{"Cotton Fabrics", "Garments"}', '{"Weaving", "Dyeing", "Stitching"}', 'Large (1000+ units/day)', '{"Sustainable Fashion", "Export", "Premium Textiles"}');

INSERT INTO public.supplier_trends (product_category, geography, demand_score, market_size, avg_price, required_setup, trending_brands, supplier_density) VALUES
('Organic Snacks', '{"city": "Mumbai", "state": "Maharashtra", "country": "India", "region": "Western India"}', 85, 2500000, 15.50, '{"Food Processing License", "Organic Certification", "Packaging Equipment"}', '{"24 Mantra", "Organic India", "Pro Nature"}', 25),
('Smart Home Devices', '{"city": "Bengaluru", "state": "Karnataka", "country": "India", "region": "Southern India"}', 92, 5000000, 850.00, '{"Electronics License", "IoT Development", "Testing Equipment"}', '{"Xiaomi", "Amazon", "Philips"}', 15),
('Sustainable Clothing', '{"city": "Delhi", "state": "Delhi", "country": "India", "region": "Northern India"}', 78, 3500000, 45.00, '{"GOTS Certification", "Eco-friendly Dyes", "Modern Looms"}', '{"Fabindia", "Nicobar", "No Nasties"}', 35),
('Health Beverages', '{"city": "Pune", "state": "Maharashtra", "country": "India", "region": "Western India"}', 88, 1800000, 25.00, '{"FSSAI License", "Bottling Equipment", "Laboratory"}', '{"Amul", "Patanjali", "Dabur"}', 20),
('Electric Vehicle Components', '{"city": "Chennai", "state": "Tamil Nadu", "country": "India", "region": "Southern India"}', 95, 8000000, 1200.00, '{"Automotive Certification", "Precision Machinery", "Quality Testing"}', '{"Tata Motors", "Mahindra", "Ather"}', 10),
('Ayurvedic Cosmetics', '{"city": "Kochi", "state": "Kerala", "country": "India", "region": "Southern India"}', 82, 1200000, 35.00, '{"Cosmetic License", "Herbal Processing", "Packaging"}', '{"Forest Essentials", "Kama Ayurveda", "Biotique"}', 18),
('Premium Tea Blends', '{"city": "Darjeeling", "state": "West Bengal", "country": "India", "region": "Eastern India"}', 90, 900000, 180.00, '{"Tea Board License", "Blending Equipment", "Export License"}', '{"Twinings", "Taj Mahal", "Lipton"}', 12),
('Handcrafted Jewelry', '{"city": "Jaipur", "state": "Rajasthan", "country": "India", "region": "Northern India"}', 75, 2200000, 250.00, '{"Hallmark Certification", "Precious Metal License", "Design Tools"}', '{"Tanishq", "PC Jeweller", "Malabar Gold"}', 45);