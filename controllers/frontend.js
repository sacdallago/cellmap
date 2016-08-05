module.exports = function(context) {

    // Imports
    var localizationsDao = context.component('daos').module('localizations');
    var proteinsDao = context.component('daos').module('proteins');

    return {
        index: function(request, response) {
            return response.render('index', {
                title: 'Home'
            });
        },
        about: function(request, response) {
            return response.render('about', {
                title: 'About'
            });
        },
        maps: function(request, response) {
            return context.gridFs.files.find().toArray(function (err, files) {
                if (err) {
                    return response.render('error', {
                        title: 'Error',
                        message: "Unable to retrieve maps metadata",
                        error: error
                    });
                }
                return response.render('maps', {
                    title: 'Maps',
                    maps: files
                });
            })
        },
        map: function(request, response) {
            const imageId = request.params.iid;
            const proteins = (function(){
                if (request.query.p !== undefined){
                    if (request.query.p.constructor === Array){
                        return request.query.p
                    } else {
                        return [request.query.p]
                    }
                } else {
                    return undefined;
                }
            })();

            if(imageId !== undefined){
                return localizationsDao.findProteins(proteins).then(function(requestProteins){
                    return response.render('map', {
                        title: 'Protein interaction visualizer',
                        iid: imageId,
                        requestProteins: requestProteins,
                        localizations: context.constants.localizations
                    });
                },function(error){
                    return response.render('error', {
                        title: 'Error',
                        message: "Unable to retrieve images metadata",
                        error: error
                    });
                });
            } else if(request.user && request.user.map){
                return response.redirect('/map/' + request.user.map + (proteins !== undefined ? "?p=" + proteins.join('&p=') : '' ));
            } else {
                return context.gridFs.findOne({},function(error, element){
                    if(error){
                        return response.status(500).render('error', {
                            title: '500',
                            message: "Cannot retrieve an image",
                            error: error
                        });
                    } else if(element === null){
                        return response.status(404).render('404', {
                            title: '404',
                            message: "Cannot retrieve an image",
                            error: error
                        });
                    } else {
                        return response.redirect('/map/' + element._id + (proteins !== undefined ? "?p=" + proteins.join('&p=') : '' ));
                    }
                });
            }
        },
        error: function(request, response) {
            return response.render('error', {
                title: 'Error',
                message: "There was an unknown error with your request.",
                error: "There was an unknown error with your request."
            });
        },
        ppi: function(request, response) {
            const imageId = request.params.iid;
            const proteins = (function(){
                if (request.query.p !== undefined){
                    if (request.query.p.constructor === Array){
                        return request.query.p
                    } else {
                        return [request.query.p]
                    }
                } else {
                    return undefined;
                }
            })();

            if(imageId !== undefined){
                return localizationsDao.findProteins(proteins).then(function(requestProteins){
                    return response.render('ppi', {
                        title: 'Protein interaction visualizer',
                        iid: imageId,
                        requestProteins: requestProteins,
                        localizations: context.constants.localizations
                    });
                }, function(error){
                    return response.render('error', {
                        title: 'Error',
                        message: "Unable to retrieve images metadata",
                        error: error
                    });
                });
            } else if(request.user && request.user.map){
                return response.redirect('/ppi/' + request.user.map + (proteins !== undefined ? "?p=" + proteins.join('&p=') : '' ));
            } else {
                return context.gridFs.findOne({},function(error, element){
                    if(error){
                        return response.status(500).render('error', {
                            title: '500',
                            message: "Cannot retrieve an image",
                            error: error
                        });
                    } else if(element === null){
                        return response.status(404).render('404', {
                            title: '404',
                            message: "Cannot retrieve an image",
                            error: error
                        });
                    } else {
                        return response.redirect('/ppi/' + element._id + (proteins !== undefined ? "?p=" + proteins.join('&p=') : '' ));
                    }
                });
            }

        },
        editor: function(request, response) {
            const imageId = request.params.iid;
            return response.render('editor', {
                title: 'Protein interaction visualizer',
                iid: imageId,
                localizations: context.constants.localizations
            });
        },
        search: function(request, response) {

            // Standardize query element: Either undefined or array.
            const query = (function(){
                if (request.query.q !== undefined){
                    if (request.query.q.constructor === Array){
                        return request.query.q
                    } else {
                        return [request.query.q]
                    }
                } else {
                    return undefined;
                }
            })();

            if(query !== undefined && query.length > 0 && query[0].length > 1){
                // !!! ONLY TAKE FIRST ELEMENT OF QUERY!
                const queryString = query[0].toUpperCase();
                proteinsDao.findProteinNames(queryString).then(function(proteins){
                    return response.render('search', {
                        title: 'Search for proteins',
                        localizations: context.constants.localizations,
                        proteins: proteins
                    });
                }, function(error){
                    return response.status(500).render('error', {
                        title: '500',
                        message: "Cannot retrieve proteins",
                        error: error
                    });
                });
            } else {
                return response.render('search', {
                    title: 'Search for proteins',
                    localizations: context.constants.localizations
                });
            }
        },

        protein: function(request, response) {
            const uniprotId = request.params.uniprotId;

            return proteinsDao.findByUniprotId(uniprotId).then(function(requestProtein){
                if(requestProtein) {
                    return proteinsDao.getPartners(requestProtein).then(function(partners){
                        return response.render('protein', {
                            title: uniprotId,
                            localizations: context.constants.localizations,
                            protein: requestProtein,
                            partners: partners
                        });
                    }, function(error){
                        return response.render('error', {
                            title: 'Error',
                            message: "Unable to retrieve protein interacitons data",
                            error: error
                        });
                    });
                } else {
                    return response.render('404', {
                        title: 'No protein',
                        message: "No protein by that name",
                        error: "No protein by that name"
                    });
                }

            }, function(error){
                return response.render('error', {
                    title: 'Error',
                    message: "Unable to retrieve protein data",
                    error: error
                });
            });

        }
    }
}