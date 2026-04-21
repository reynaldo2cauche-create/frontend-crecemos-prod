import { Box, Divider, Grid, Typography } from '@mui/material'
import React from 'react'
import { FontSize, ThemePalette } from '../../theme/theme'
import { TitleSection } from '../../components/TitleSection/TitleSection'
import { TypeTitleSection } from '../../constants/TitleSection.constant'
import { ServiceDetail } from '../../components/ServiceDetail/ServiceDetail'

const itemData = [
  {
    id: '1',
    img: '/staff1.jpg',
    title: 'Lic. Saidi Navaro',
    profession: 'Terapeuta de lenguaje',
  },
  {
    id: '2',
    img: '/staff4.jpg',
    title: 'Lic. Merlin Fernandez',
    profession: 'Terapeuta de lenguaje',
  },
  {
    id: '3',
    img: '/staff3.jpg',
    title: 'Lic. Erika Vivas',
    profession: 'Terapeuta de lenguaje',
  }
]

const textDetail = 'Nuestros profesionales son tecnólogos médicos especializados en terapia de lenguaje que brindan al menor: evaluaciones, diagnóstico, pronóstico, programación y tratamiento preventivo en las deficiencias, relacionadas con el habla, lenguaje, voz, y deglución.'

export const TerapiaLenguajePage = () => {
  return (
    <Box  p='35px 50px 41px' display='flex' gap='30px' flexDirection='column' >

      <ServiceDetail
        section1={{
          image:'fondo-terapia-lenguaje.png',
          text: ''
        }}
        section2={{
          title:'Terapia de Lenguaje',
          text: textDetail,
          image: 'terapias.jpg'
        }}
        section3={{
          title: 'Profesionales',
          persons: itemData
        }}
      />

      <Box>
        <img src='/fondo-terapia-lenguaje.png' width='100%' />
      </Box>

      <Grid container rowSpacing='20px' columnSpacing='40px' sx={{ backgroundColor: ThemePalette.PURPLE_LIGHT_CARD }} padding='10px 0px 30px 0px'>
        <Grid item xs={12} md={6} display='flex' justifyContent='center'>
          <img src='/terapias.jpg' width='100%' />
        </Grid>
        <Grid item xs={12} md={6} component='div' display='flex' flexDirection='column' gap='10px'>
          {/* <TitleSection 
            title='Nuestra Historia'
            classname={TypeTitleSection.WHITE}
          />   */}
          <Box>
            <Typography 
              component='h2' 
              fontSize={FontSize.TITLE_SECTION} 
              color={ThemePalette.WHITE} 
              textAlign='center'
            >
              Terapia de Lenguaje
            </Typography>
            <Divider sx={{ backgroundColor: ThemePalette.WHITE, width: '150px', margin: 'auto' }} />
          </Box>
          
          <Typography 
            component='p' 
            textAlign='justify' 
            fontSize={FontSize.PARAGRAPH} 
            color={ThemePalette.WHITE}
            >
              Nuestros profesionales son tecnólogos médicos especializados en terapia de lenguaje que brindan al menor: evaluaciones, diagnóstico, pronóstico, programación y tratamiento preventivo en las deficiencias, relacionadas con el habla, lenguaje, voz, y deglución.
          </Typography>         
        </Grid>
      </Grid>
      
      <Box display='flex' flexDirection='column' gap='20px'>
        <Box>
          <Typography 
            component='h2' 
            fontSize={FontSize.TITLE_SECTION} 
            color={ThemePalette.PURPLE_LIGHT} 
            fontWeight='bold' 
            textAlign='center'
          >
            Profesionales
          </Typography>
          <Divider sx={{ backgroundColor: ThemePalette.PURPLE_LIGHT, width: '90px', margin: 'auto' }} />
        </Box>
        <Grid container component="div" display="flex" spacing='40px' justifyContent='center'>
          {itemData.map((item) => (
            <Grid item xs={12} sm={6} md={3} key={item.id}>
              <img style={{ borderRadius: '30px' }} src={item.img} alt={item.title} width='100%'/>
              <Box>
                <Typography component="div" textAlign='center' fontWeight='bold' color={ThemePalette.PURPLE_LIGHT} fontSize={FontSize.TITLE_PARAGRAPH}>
                  {item.title}
                </Typography>
                <Typography gutterBottom component="div" textAlign='center' color={ThemePalette.BLACK_MEDIUM} fontSize={FontSize.PROFESSION_IMAGE_STAFF}>
                  {item.profession}
                </Typography>
              </Box>
            </Grid>
          ))}
        </Grid>
      </Box>
      
    </Box>
  )
}
