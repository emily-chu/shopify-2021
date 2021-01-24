import React from 'react';

export default class Movie extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      nominated: false
    };
  }

  componentDidMount() {}
  
  render() {
    return (
      <div className ="movie">
        <h4>{this.props.Title + " (" + this.props.Year + ")"}</h4>
        <img src={this.props.Poster} alt="Movie poster"></img>
      </div>
    );
  }
}