"use strict"


angular.module('movieAnaysisApp', [])
     .controller('moviewAnalysisController', ['$scope', 'moviewService', function ($scope, moviewService) {
	
    console.log('Main Controller Loaded.');
    
        this.limit = 10;
        this.start = 0;
        this.currentPage = 0;
        this.currenPageDisplay = this.currentPage + 1;
        this.lastPage = 0;
        this.genres = [];
        this.language = [];
        this.country = [];
        this.budget = [];
        this.year = [];
        this.sortProperty = 'movie_title';
        this.descending = false;
        let _this = this;

        
        moviewService.getMovies().then(result => {
            console.log(result);
            if (null != result) {
                this.movies = angular.copy(result);
                this.filteredMovies = angular.copy(result);
                this.lastPage =  Math.floor(this.filteredMovies.length / this.limit) + 1;
                
                for (let i = 0; i < this.movies.length; i++) {
                    let movie = this.movies[i];
                    createSet(movie.genres, this.genres);
                    createSet(movie.language, this.language);
                    createSet(movie.country, this.country);
                    createSet(movie.budget, this.budget);
                    createSet(movie.title_year, this.year);
                }
                
                this.genres = removeDupes(this.genres);
                this.language = removeDupes(this.language);
                this.country = removeDupes(this.country);
                this.budget = removeDupes(this.budget);
                this.year = removeDupes(this.year);
            }
            
        });

        function removeDupes (array) {
            return Array.from(new Set(array));
        }

        /**
         * 
         * @param {*} string 
         * @param {*} set 
         */
        function createSet (string, set) {
            if (null != string && string.length) {
                let tempArray = string.split('|');
                tempArray.forEach((element) => {
                    set.push(element);
                });
            }
        }

        this.sortByProperty = function (prop) {

            if (this.sortProperty == prop) {
                this.descending = !this.descending;
            } else {
                this.descending = false;
            }

           this.sortProperty = prop;
          };

        $scope.$watch(() => {
            if(this.filteredMovies)
                return this.filteredMovies.length
            }, (newLength) => {
            this.lastPage = Math.floor(newLength / this.limit) + 1;
            this.goToPage('first');
        })

        this.goToPage = function (event, page) {
            debugger
            if (page != null && event != null && event.type == 'click') {
                switch (page) {
                    case 'next':
                        if (this.currentPage < Math.floor(this.filteredMovies.length / this.limit)) {
                            this.start = (this.currentPage * this.limit) + this.limit;
                            this.currentPage++;
                        }    
                        break;
                    case 'previous':
                        if (this.currentPage > 0) {
                            this.start = (this.currentPage * this.limit) - this.limit;
                            this.currentPage--;
                        }
                        break;
                    case 'last':
                       this.currentPage = Math.floor(this.filteredMovies.length / this.limit);
                       this.start = this.currentPage * this.limit;
                       this.currenPageDisplay = this.currentPage + 1;
                       break;
                    case 'first':
                       this.currentPage = 0;
                       this.start = 0;
                       break;
                }
                this.currenPageDisplay = this.currentPage + 1;
            } else if (page != null && event != null && event.type == "keyup") {
                let pageNumber = Number(page);
                if (!isNaN(pageNumber) && pageNumber > 0 && pageNumber <= this.lastPage) {
                    this.currentPage = pageNumber - 1;
                    this.start = this.currentPage * this.limit;
                }
            }
        }
	
    }])
    .factory('moviewService', ['$http', function ($http) {

        let movieServiceObj = {
            loadMovies,
            getMovies
        }

        let movieList = [];
        
        function getMovies () {
            if (movieList.length) {
                return new Promise((resolve, reject) => {
                    resolve(movieList);
                });
            } else {
                return loadMovies();
            }
        }

        function loadMovies () {
            return $http({
                method: 'GET',
                url: 'http://starlord.hackerearth.com/movies'
            }).then(result => {
                return result.data;
            });
        }

        return movieServiceObj;

    }])
    .filter('pipeFilter', [function () {
        return function (input) {
            if (input != null) {
                return input.replace(/\|/g, ', ');
            }
        }
    }]);
