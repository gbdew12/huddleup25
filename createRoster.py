import nfl_data_py as nfl
import pandas as pd
years = [2024]
cols = ['player_display_name', 'position', 'recent_team', 'week','fantasy_points_ppr']

df=nfl.import_weekly_data(years, cols)
df.to_csv('roster.csv', index = False)
