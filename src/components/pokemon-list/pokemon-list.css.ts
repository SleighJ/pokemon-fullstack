import { style } from '@vanilla-extract/css';

export const pokemonListContainer = style({
  border: '1px solid green',
  display: 'flex',
  flexWrap: 'wrap',
  flexDirection: 'row',
  height: '100%',
  overflow: 'auto'
});

