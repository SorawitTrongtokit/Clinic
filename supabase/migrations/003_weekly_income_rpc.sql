-- RPC Function: Get weekly income in a single query (fixes N+1 problem)
CREATE OR REPLACE FUNCTION get_weekly_income()
RETURNS TABLE (
    visit_date DATE,
    daily_income NUMERIC
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        DATE(created_at) as visit_date,
        COALESCE(SUM(total_cost), 0) as daily_income
    FROM visits
    WHERE created_at >= (CURRENT_DATE - INTERVAL '6 days')
      AND created_at < (CURRENT_DATE + INTERVAL '1 day')
    GROUP BY DATE(created_at)
    ORDER BY visit_date ASC;
END;
$$ LANGUAGE plpgsql;
