# Libraries #### 
library(xlsx) # read xlsx
library(reshape) # melt
library(dplyr) # filter
library(tidyr) # spread
setwd("~/Dropbox/- Code/- Github/economicgrowthCO2/data/dataRaw")

# Source data ####
# fileURL <- "http://www.iea.org/media/statistics/CO2Highlights.xls"
# download.file(fileURL, destfile="../rawData/CO2Highlights.xls"); rm(fileURL)

# Read all sheets and merge into one big file ####
co2 <- read.xlsx("CO2Highlights.xls", sheetName = "CO2 FC", startRow = 24, endRow = 184, header = T) # read CO2 data
co2 <- melt(co2, id.vars=c("Region.Country.Economy"))
tpes <- read.xlsx("CO2Highlights.xls", sheetName = "TPES Mtoe", startRow = 24, endRow = 184, header = T) # read TPES data
tpes <- melt(tpes, id.vars=c("Region.Country.Economy"))
co2$TPES <- tpes[,3]; rm(tpes)
gdp <- read.xlsx("CO2Highlights.xls", sheetName = "GDP", startRow = 22, endRow = 182, header = T) # read GDP data
gdp <- melt(gdp, id.vars=c("Region.Country.Economy"))
co2$GDP <- gdp[,3]; rm(gdp)
pop <- read.xlsx("CO2Highlights.xls", sheetName = "POP", startRow = 22, endRow = 182, header = T) # read POP data
pop <- melt(pop, id.vars=c("Region.Country.Economy"))
co2$POP <- pop[,3]; rm(pop)
co2tpes <- read.xlsx("CO2Highlights.xls", sheetName = "CO2-TPES", startRow = 22, endRow = 182, header = T) # read CO2-TPES data
co2tpes <- melt(co2tpes, id.vars=c("Region.Country.Economy"))
co2$CO2TPES <- co2tpes[,3]; rm(co2tpes)
dat <- co2; rm(co2)
colnames(dat)[1:3] <- c("Country", "Year", "CO2")

# Remove regions and other aggregates; set ".." to equal NA ####
regions <- c("OECD Americas", "OECD Asia Oceania", "OECD Europe", "Former Soviet Union (if no detail)", 
             "Former Yugoslavia (if no detail)", "Non-OECD Europe and Eurasia", "Other Africa", "Africa", "Other Asia", 
             "Asia (excl. China)", "China (incl. Hong Kong, China)", "Other Non-OECD Americas", 
             "Non-OECD Americas", "Middle East", "European Union - 28", "G7", "G8", "G20") # remove non-countries from set
dat <- dat[ !dat$Country %in% regions, ]; rm(regions) # remove non-countries, mostly regional groupings, from data
dat[ dat == ".." ] = NA # set .. equal to NA
dat$Country <- gsub("Côte d'Ivoire","Cote d'Ivoire", dat$Country)
dat$Country <- gsub("Curaçao","Curacao", dat$Country)

# Harmonize countries
countries = read.csv('backup/countries.csv', header = T)
dat = merge(dat, countries,
            by.dat = 'Country',
            by.countries = 'Country')

dat = dat[,c(8, 2:7)]
colnames(dat)[1] = 'Country'

# Add regions ####
countryregions <- read.csv("backup/countryregions.csv", header = T) ## separate file matching countries to regions 
dat <- merge(dat, countryregions, by.dat = "Country", by.countryregions = "Country"); rm(countryregions)
dat <- dat[,c(1,8,2:7)]

# Transform factor variables into numeric ####
dat <- transform(dat,
                 CO2 = as.numeric(levels(CO2)[CO2]),
                 TPES = as.numeric(levels(TPES)[TPES]),
                 GDP = as.numeric(levels(GDP)[GDP]),
                 POP = as.numeric(levels(POP)[POP]),
                 CO2TPES = as.numeric(levels(CO2TPES)[CO2TPES]))

# Calculate new indicators and intensities ####
dat <- mutate(dat, 
              CO2CAPITA = CO2/POP, 
              ENERGYCAPITA = TPES/POP, 
              GDPCAPITA = GDP/POP, 
              TPESGDP = TPES/GDP)

# Calculate peak level and year for each variable ####
datpeaks <- melt(dat, id.vars=c("Country", "Region", "Year"))
colnames(datpeaks)[4:5] <- c("Variable", "Value")
datpeaks <- spread(datpeaks, Year, Value)
datpeaks[, "Peak"] <- apply(datpeaks[, 4:47], 1, max, na.rm=T)
options(warn = -1); datpeaks[, "Pre.2007"] <- apply(datpeaks[, 4:39], 1, max, na.rm=T)
options(warn = -1); datpeaks[, "2007.2013"] <- apply(datpeaks[, 40:46], 1, max, na.rm=T)
datpeaks$Peak.Period <- ifelse(datpeaks$Peak == datpeaks$X2014, "2014 Max", 
                               ifelse(datpeaks$Peak == datpeaks$Pre.2007, "Pre 2007", "2007-2013"))
for (i in 1:nrow(datpeaks)) {
        datpeaks$Peak.Year[i] <- match(datpeaks$Peak[i], datpeaks[i, 4:47])+1970}
rm(i)
datpeakyear <- datpeaks[,c(1:3,52, 51)]
datpeakyear$Index = paste0(datpeakyear$Country, '.', datpeakyear$Variable)
datpeakyear = datpeakyear[,c(6,4,5)]
rm(datpeaks)

# Create new series with all variables indexed to peak ####
datpeaks <- melt(dat, id.vars=c("Country", "Region", "Year"))
colnames(datpeaks)[4:5] <- c("Variable", "Value")
datpeaks <- spread(datpeaks, Year, Value)
datpeaks[, "Peak"] <- apply(datpeaks[, 4:47], 1, max, na.rm=T)
datpeaks <- datpeaks %>% mutate_each(funs((./Peak)*100), starts_with("X"))
datpeaks <- datpeaks[,1:ncol(datpeaks)-1]
datpeaks <- melt(datpeaks, id.vars=c("Country", "Region", "Variable"))
datpeaks$variable <- gsub("X","", datpeaks$variable) # eliminate X from year column
colnames(datpeaks) <- c("Country", "Region", "Variable", "Year", "Value") # rename column
datpeaks <- transform (datpeaks, Year = as.integer(Year))
datpeaks$Unit = 'Peak=100'

# Create new series with all variables indexed to 1990 ####
datbase1990 <- melt(dat, id.vars=c("Country", "Region", "Year"))
colnames(datbase1990)[4:5] <- c("Variable", "Value")
datbase1990 <- spread(datbase1990, Year, Value)
datbase1990$Base <- datbase1990$X1990
datbase1990 <- datbase1990 %>% mutate_each(funs((./Base)*100), starts_with("X"))
datbase1990 <- datbase1990[,1:47]
datbase1990 <- melt(datbase1990, id.vars=c("Country", "Region", "Variable"))
datbase1990$variable <- gsub("X","", datbase1990$variable) # eliminate X from year column
colnames(datbase1990) <- c("Country", "Region", "Variable", "Year", "Value") # rename column
datbase1990 <- transform (datbase1990, Year = as.integer(Year))
datbase1990$Unit = '1990=100'

# Final clean-up ####
dat$Year <- gsub("X","", dat$Year) # eliminate X from year column
dat <- transform (dat, Year = as.integer(Year))
dat <- melt(dat, id.vars=c("Country", "Region", "Year"))
colnames(dat)[4:5] <- c("Variable", "Value")

# Read in the units for each variable 
units = read.csv("backup/variableunits.csv", header = T) ## separate file matching countries to regions 
dat <- merge(dat, units, by.dat = "Variable", by.units = "Variable"); rm(units)

dat = dat[,c(2,3,1,4:6)]
dat = rbind(dat, datbase1990,datpeaks)
rm(datbase1990, datpeaks)

dat$Index = paste0(dat$Country, '.', dat$Variable)
dat = merge(dat, datpeakyear, by.dat = 'Index', by.datpeakyear = 'Index')
rm(datpeakyear)

dat <- dat[,c(2, # Country
              3, # Region
              4, # Variablee
              7, # Unit
              8, # Peak year
              9, # Peak period
              5, # Year
              6)] # Value

rm(countries)

# Subset data for maps ####
df = dat[ dat$Year == 2014,]
df = df[ !df$Unit %in% c('1990=100','Peak=100'), ]
df = df[df$Variable %in% c('GDP',
                           'GDPCAPITA',
                           'TPES',
                           'ENERGYCAPITA',
                           'CO2',
                           'CO2CAPITA'),]
df$Variable <- gsub('TPES',"ENERGY", df$Variable)
df = df[,c(1,3,5)]

df$Vintage = ifelse(df$Peak.Year < 1990, 'Before 1990',
                    ifelse(df$Peak.Year <= 1999, 'From 1990 to 1999',
                           ifelse(df$Peak.Year <= 2007, 'From 2000 to 2007',
                                  ifelse(df$Peak.Year <= 2013,
                                         'From 2008 to 2013', 'Highest was 2014'))))

colnames(df)[3] = 'PeakYear'

countrycodes <- read.csv("backup/countrycodesID.csv")
countrycodes$CountryID = formatC(countrycodes$CountryID, width = 3, flag = "0")
df <- merge(df, countrycodes, by.df = "Country", by.countrycodes = "Country"); rm(countrycodes)
df <- df[,c(1,5,6, 2,4)]
colnames(df)[3] = 'id'

df = spread(df, Variable, Vintage)
write.csv(df, '../peaks.csv', row.names = F)

# CSV file with all data indexed to 1990 ####
df = dat[ dat$Unit == '1990=100',]
df = df[, c(1:3,7:8)]
df = df[df$Variable %in% c('CO2', 'TPES', 'GDP', 'CO2CAPITA', 'ENERGYCAPITA', 'GDPCAPITA'),]
df$Variable <- gsub('TPES',"ENERGY", df$Variable)
df = na.omit(df)
df = spread(df, Variable, Value)

write.csv(df, '../data1990.csv', row.names = F)

# CSV file with all data for 2014 ####
df = dat[dat$Year == '2014',]
df = df [ !df$Unit %in% c('1990=100','Peak=100'),]
df = df [,c(1:3,7:8)]
df = spread(df, Variable, Value)
write.csv(df, '../data2014.csv', row.names = FALSE)

# List of countries for drop-down menu
countries = factor(unique(df$Country))
countries = paste0('<option value="', countries, '">Algeria</option>')
write.csv(countries)

